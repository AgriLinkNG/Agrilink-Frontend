// Upload service for Agrilink Backend API
import { api } from './api';
import { ProductImage, ImageUploadResponse } from '@/types/listings';
import { compressToTargetSize, needsCompression } from '@/lib/imageCompressor';

export class UploadService {
  private static instance: UploadService;

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  /**
   * Upload product images (farmer only)
   * @param files - Array of image files (max 10 files, 2MB each)
   * @returns Array of uploaded image objects with URLs
   */
  async uploadProductImages(files: File[]): Promise<ProductImage[]> {
    // Validate file count
    if (files.length > 10) {
      throw new Error('Maximum 10 images allowed per upload');
    }

    // Validate file types only (size will be handled by compression)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP allowed.`);
      }
    }

    // Compress all images to work around backend size limits
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        if (needsCompression(file, 100)) {
          // Compress to 100KB max to work with backend limits
          const originalSize = file.size;
          const compressed = await compressToTargetSize(file, 100);

          if (import.meta.env.DEV) {
            console.log('🗜️ Compressed image:', {
              name: file.name,
              original: `${(originalSize / 1024).toFixed(2)} KB`,
              compressed: `${(compressed.size / 1024).toFixed(2)} KB`,
              reduction: `${(((originalSize - compressed.size) / originalSize) * 100).toFixed(1)}%`,
            });
          }

          return compressed;
        }
        return file;
      })
    );

    const formData = new FormData();
    processedFiles.forEach(file => {
      formData.append('images', file);
      // Log file details for debugging
      if (import.meta.env.DEV) {
        console.log('📤 Uploading file:', {
          name: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: file.type,
        });
      }
    });

    const response = await api.upload<{ data: ImageUploadResponse }>(
      '/uploads/product-images',
      formData
    );

    if (response.success && response.data?.data?.images) {
      return response.data.data.images;
    }

    // Provide detailed error information
    const errorMsg = response.message || 'Failed to upload images';
    throw new Error(errorMsg);
  }

  /**
   * Upload a single product image
   */
  async uploadSingleImage(file: File, isPrimary: boolean = false): Promise<ProductImage> {
    const images = await this.uploadProductImages([file]);

    if (images.length > 0) {
      return { ...images[0], isPrimary };
    }

    throw new Error('Failed to upload image');
  }

  /**
   * Delete a product image by filename (farmer only)
   */
  async deleteProductImage(filename: string): Promise<void> {
    const response = await api.delete(`/uploads/product-images/${filename}`);

    if (!response.success) {
      throw new Error('Failed to delete image');
    }
  }
}

// Export singleton instance
export const uploadService = UploadService.getInstance();
