// Image Compression Utility
// Compress images before upload to reduce file size

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  maxSizeKB: 500, // Target max 500KB
};

/**
 * Compress an image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        try {
          const compressed = compressImageElement(img, file.name, opts);
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image element
 */
function compressImageElement(
  img: HTMLImageElement,
  filename: string,
  options: CompressionOptions
): File {
  const { maxWidth, maxHeight, quality } = options;

  // Calculate new dimensions
  let width = img.width;
  let height = img.height;

  if (maxWidth && width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  if (maxHeight && height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw image on canvas
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to blob
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to compress image'));
          return;
        }

        // Create file from blob
        const compressedFile = new File([blob], filename, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        resolve(compressedFile);
      },
      'image/jpeg',
      quality
    );
  }) as any;
}

/**
 * Compress image with progressive quality reduction until target size is met
 */
export async function compressToTargetSize(
  file: File,
  maxSizeKB: number = 500
): Promise<File> {
  let quality = 0.9;
  let compressed = file;
  let attempts = 0;
  const maxAttempts = 5;

  while (compressed.size > maxSizeKB * 1024 && attempts < maxAttempts) {
    compressed = await compressImage(file, { quality });
    quality -= 0.15;
    attempts++;

    if (import.meta.env.DEV) {
      console.log(
        `🗜️ Compression attempt ${attempts}: ${(compressed.size / 1024).toFixed(2)} KB (quality: ${(quality + 0.15).toFixed(2)})`
      );
    }
  }

  return compressed;
}

/**
 * Batch compress multiple images
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map((file) => compressImage(file, options));
  return Promise.all(compressionPromises);
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if compression is needed
 */
export function needsCompression(file: File, maxSizeKB: number = 500): boolean {
  return file.size > maxSizeKB * 1024;
}
