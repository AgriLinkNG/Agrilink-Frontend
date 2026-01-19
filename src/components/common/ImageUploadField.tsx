/**
 * ImageUploadField - Reusable image upload component with validation
 * Handles single and multiple image uploads with preview, progress, and error states
 */
import React, { useRef, useState } from 'react';
import { uploadService } from '@/services/uploadService';
import { ProductImage } from '@/types/listings';
import { validateImageFile } from '@/schemas/listingSchema';

interface ImageUploadFieldProps {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value = [],
  onChange,
  maxImages = 5,
  error,
  disabled = false,
  className = '',
}) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle file selection
  const handleFileSelect = (index: number) => {
    if (disabled || uploadingIndex !== null) return;
    fileInputRefs.current[index]?.click();
  };

  // Handle file input change
  const handleFileChange = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setUploadError(null);
    setUploadingIndex(index);

    try {
      const isPrimary = index === 0 || value.length === 0;
      const uploadedImage = await uploadService.uploadSingleImage(file, isPrimary);

      const newImages = [...value];
      if (index < newImages.length) {
        // Replace existing image
        newImages[index] = uploadedImage;
      } else {
        // Add new image
        newImages.push(uploadedImage);
      }
      onChange(newImages);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingIndex(null);
      // Reset the file input
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index]!.value = '';
      }
    }
  };

  // Remove image
  const handleRemoveImage = async (index: number) => {
    const imageToRemove = value[index];

    try {
      // Try to delete from server
      if (imageToRemove.filename) {
        await uploadService.deleteProductImage(imageToRemove.filename);
      }
    } catch (err) {
      console.error('Failed to delete image from server:', err);
    }

    // Remove from local state
    const newImages = value.filter((_, i) => i !== index);

    // Ensure first image is marked as primary
    if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }

    onChange(newImages);
  };

  // Set primary image
  const handleSetPrimary = (index: number) => {
    const newImages = value.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(newImages);
  };

  return (
    <div className={className}>
      {/* Error display */}
      {(error || uploadError) && (
        <p className="text-red-500 text-sm mb-2 font-['MadaniArabic-Regular']">
          {error || uploadError}
        </p>
      )}

      {/* Image grid */}
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: maxImages }).map((_, index) => {
          const image = value[index];
          const isUploading = uploadingIndex === index;

          return (
            <div key={index} className="relative">
              {/* Hidden file input */}
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[index] = el)}
                onChange={(e) => handleFileChange(index, e)}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                disabled={disabled || isUploading}
              />

              {/* Upload button / Preview */}
              <button
                type="button"
                onClick={() => handleFileSelect(index)}
                disabled={disabled || isUploading}
                className={`
                  w-24 h-24 rounded-[10px] overflow-hidden
                  ${!image ? 'bg-gray-200 hover:bg-gray-300' : ''}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-brand-colors-SproutGreen focus:ring-offset-2
                `}
              >
                {image ? (
                  <img
                    src={image.url}
                    alt={image.alt || `Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : isUploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-colors-SproutGreen" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-3xl">+</span>
                  </div>
                )}
              </button>

              {/* Image controls */}
              {image && !isUploading && (
                <>
                  {/* Primary badge */}
                  {image.isPrimary && (
                    <div className="absolute bottom-1 left-1 bg-brand-colors-SproutGreen text-white text-xs px-1.5 py-0.5 rounded font-['MadaniArabic-Medium']">
                      Primary
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="absolute top-1 right-1 flex gap-1">
                    {/* Set as primary button */}
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(index);
                        }}
                        className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-blue-600 transition-colors"
                        title="Set as primary"
                      >
                        ★
                      </button>
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Help text */}
      <p className="mt-2 text-xs text-gray-500 font-['MadaniArabic-Regular']">
        Upload up to {maxImages} images. JPEG, PNG, or WebP. Max 10MB each.
        {value.length === 0 && ' First image will be the primary image.'}
      </p>
    </div>
  );
};

export default ImageUploadField;
