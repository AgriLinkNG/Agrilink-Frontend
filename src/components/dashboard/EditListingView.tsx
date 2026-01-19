import React, { useRef, useState, useEffect } from 'react';
import { uploadService } from '@/services/uploadService';
import { farmAddressService } from '@/services/farmAddressService';
import { ApiRequestError } from '@/services/api';
import ApiErrorDisplay from '@/components/ui/ApiErrorDisplay';
import { useUpdateListing } from '@/hooks/useListingsQuery';
import {
  Listing,
  UpdateListingRequest,
  ProductImage,
  FarmAddress,
  ProductCategory,
  UnitOfMeasurement,
  CATEGORY_DISPLAY_NAMES,
  UNIT_DISPLAY_NAMES,
} from '@/types/listings';

interface EditListingViewProps {
  listing: Listing;
  onUpdate: (updatedListing: Listing) => void;
  onCancel: () => void;
}

const EditListingView: React.FC<EditListingViewProps> = ({
  listing,
  onUpdate,
  onCancel
}) => {
  // Form state
  const [formData, setFormData] = useState({
    produceName: listing.produceName,
    produceDescription: listing.produceDescription,
    category: listing.category,
    unitPrice: listing.unitPrice.toString(),
    unitOfMeasurement: listing.unitOfMeasurement,
    quantityAvailable: listing.quantityAvailable.toString(),
    minimumOrderQuantity: listing.minimumOrderQuantity.toString(),
    farmAddress: typeof listing.farmAddress === 'string'
      ? listing.farmAddress
      : listing.farmAddress._id,
    harvestDate: listing.harvestDate || '',
    expiryDate: listing.expiryDate || '',
    organicCertified: listing.organicCertified,
    tags: listing.tags.join(', '),
  });

  // Image state
  const [images, setImages] = useState<ProductImage[]>(listing.images || []);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Farm addresses
  const [farmAddresses, setFarmAddresses] = useState<FarmAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<ApiRequestError | Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // React Query mutation hook
  const updateListingMutation = useUpdateListing();

  // Fetch farm addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addresses = await farmAddressService.getAddresses();
        setFarmAddresses(addresses);
      } catch (err) {
        console.error('Failed to fetch farm addresses:', err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  // Handle scroll for custom scrollbar
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const maxScroll = scrollHeight - clientHeight;
      const scrollPercentage = maxScroll > 0 ? scrollTop / maxScroll : 0;
      setScrollPosition(scrollPercentage);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Handle image upload
  const handleImageUpload = async (index: number, file: File) => {
    if (!file) return;

    // Validate file type (size will be automatically compressed)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(new Error('Please upload only JPEG, PNG, or WebP images'));
      return;
    }

    setIsUploadingImage(true);
    setUploadingIndex(index);
    setError(null);

    try {
      const isPrimary = index === 0 || images.length === 0;
      const uploadedImage = await uploadService.uploadSingleImage(file, isPrimary);

      const newImages = [...images];
      if (index < newImages.length) {
        newImages[index] = uploadedImage;
      } else {
        newImages.push(uploadedImage);
      }
      setImages(newImages);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err instanceof Error ? err : new Error('Failed to upload image'));
    } finally {
      setIsUploadingImage(false);
      setUploadingIndex(null);
    }
  };

  // Handle image selection click
  const handleImageSelect = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  // Handle file input change
  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(index, file);
    }
  };

  // Remove image
  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];

    try {
      // Try to delete from server
      if (imageToRemove.filename) {
        await uploadService.deleteProductImage(imageToRemove.filename);
      }
    } catch (err) {
      console.error('Failed to delete image from server:', err);
    }

    // Remove from local state
    const newImages = images.filter((_, i) => i !== index);
    // Ensure first image is marked as primary
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    setImages(newImages);
  };

  // Set primary image
  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setImages(newImages);
  };

  // Save changes
  const handleSaveChanges = async () => {
    // Validation
    if (!formData.produceName.trim()) {
      setError(new Error('Product name is required'));
      return;
    }
    if (!formData.produceDescription.trim()) {
      setError(new Error('Description is required'));
      return;
    }
    if (!formData.unitPrice || parseFloat(formData.unitPrice) < 0) {
      setError(new Error('Valid price is required'));
      return;
    }
    if (images.length === 0) {
      setError(new Error('At least one image is required'));
      return;
    }
    if (!formData.farmAddress) {
      setError(new Error('Farm address is required'));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updateData: UpdateListingRequest = {
        produceName: formData.produceName,
        produceDescription: formData.produceDescription,
        category: formData.category as ProductCategory,
        unitPrice: parseFloat(formData.unitPrice),
        unitOfMeasurement: formData.unitOfMeasurement as UnitOfMeasurement,
        quantityAvailable: parseInt(formData.quantityAvailable) || 0,
        minimumOrderQuantity: parseInt(formData.minimumOrderQuantity) || 1,
        farmAddress: formData.farmAddress,
        images: images,
        organicCertified: formData.organicCertified,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      // Only include dates if they have values
      if (formData.harvestDate) {
        updateData.harvestDate = formData.harvestDate;
      }
      if (formData.expiryDate) {
        updateData.expiryDate = formData.expiryDate;
      }

      // Use React Query mutation (automatically invalidates cache)
      const updatedListing = await updateListingMutation.mutateAsync({
        id: listing._id,
        data: updateData,
      });

      setSuccessMessage('Product updated successfully!');

      // Notify parent after a short delay
      setTimeout(() => {
        onUpdate(updatedListing);
      }, 1000);

    } catch (err) {
      console.error('Failed to update listing:', err);
      setError(err instanceof Error ? err : new Error('Failed to update product'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden relative">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-[474px] h-full left-[20px] top-[10px] absolute overflow-y-auto pr-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        <ApiErrorDisplay
          error={error}
          context="updating product listing"
          onRetry={handleSaveChanges}
          onDismiss={() => setError(null)}
        />

        {/* Upload Images Section */}
        <div className="w-[474px] mb-5">
          <div className="px-2.5 mb-3 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
            Product Images: <span className="text-sm text-gray-500">(Click to replace, max 10)</span>
          </div>
          <div className="h-56 flex flex-wrap gap-4 content-start">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="w-24 h-24 relative overflow-hidden">
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[index] = el)}
                  onChange={(e) => handleFileChange(index, e)}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => handleImageSelect(index)}
                  disabled={isUploadingImage}
                  className="w-24 h-24 rounded-[10px] object-cover cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {images[index] ? (
                    <img
                      className="w-24 h-24 rounded-[10px] object-cover"
                      src={images[index].url}
                      alt={images[index].alt || `Product ${index + 1}`}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-[10px] flex items-center justify-center">
                      {uploadingIndex === index ? (
                        <span className="text-gray-400 text-xs">Uploading...</span>
                      ) : (
                        <span className="text-gray-400 text-2xl">+</span>
                      )}
                    </div>
                  )}
                </button>
                {images[index] && (
                  <>
                    {/* Primary indicator */}
                    {images[index].isPrimary && (
                      <div className="absolute bottom-1 left-1 bg-brand-colors-SproutGreen text-white text-xs px-1 rounded">
                        Primary
                      </div>
                    )}
                    {/* Action buttons */}
                    <div className="absolute top-1 right-1 flex gap-1">
                      {!images[index].isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(index)}
                          className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-blue-600"
                          title="Set as primary"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Produce Name */}
        <div className="w-[474px] mb-5 flex flex-col gap-3">
          <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
            Produce Name: <span className="text-red-500">*</span>
          </div>
          <input
            type="text"
            value={formData.produceName}
            onChange={(e) => handleFieldChange('produceName', e.target.value)}
            className="h-12 px-6 py-3 bg-black/5 rounded-[30px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular']"
            placeholder="Enter product name"
          />
        </div>

        {/* Category */}
        <div className="w-[474px] mb-5 flex flex-col gap-3">
          <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
            Category: <span className="text-red-500">*</span>
          </div>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              className="w-full h-12 px-6 py-3 bg-black/5 rounded-[30px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular'] appearance-none cursor-pointer"
            >
              {Object.entries(CATEGORY_DISPLAY_NAMES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <img src="/chevron-down-2.svg" alt="Dropdown" className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Price and Unit */}
        <div className="w-[474px] mb-5 flex gap-4">
          <div className="flex-1 flex flex-col gap-3">
            <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
              Unit Price (₦): <span className="text-red-500">*</span>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => handleFieldChange('unitPrice', e.target.value)}
              className="h-12 px-6 py-3 bg-black/5 rounded-[30px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular']"
              placeholder="0.00"
            />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
              Unit:
            </div>
            <div className="relative">
              <select
                value={formData.unitOfMeasurement}
                onChange={(e) => handleFieldChange('unitOfMeasurement', e.target.value)}
                className="w-full h-12 px-6 py-3 bg-black/5 rounded-[30px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular'] appearance-none cursor-pointer"
              >
                {Object.entries(UNIT_DISPLAY_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <img src="/chevron-down-2.svg" alt="Dropdown" className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Quantity and Minimum Order */}
        <div className="w-[474px] mb-5 flex gap-4">
          <div className="flex-1 flex flex-col gap-3">
            <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
              Quantity Available:
            </div>
            <input
              type="number"
              min="0"
              value={formData.quantityAvailable}
              onChange={(e) => handleFieldChange('quantityAvailable', e.target.value)}
              className="h-12 px-6 py-3 bg-black/5 rounded-[30px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular']"
              placeholder="0"
            />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
              Min. Order Qty:
            </div>
            <input
              type="number"
              min="1"
              value={formData.minimumOrderQuantity}
              onChange={(e) => handleFieldChange('minimumOrderQuantity', e.target.value)}
              className="h-12 px-6 py-3 bg-black/5 rounded-[30px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular']"
              placeholder="1"
            />
          </div>
        </div>

        {/* Description */}
        <div className="w-[474px] mb-5 flex flex-col gap-3">
          <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
            Description: <span className="text-red-500">*</span>
          </div>
          <textarea
            value={formData.produceDescription}
            onChange={(e) => handleFieldChange('produceDescription', e.target.value)}
            className="h-24 px-6 py-3 bg-black/5 rounded-[20px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular'] resize-none"
            placeholder="Describe your product..."
          />
        </div>

        {/* Farm Address */}
        <div className="w-[474px] mb-5 flex flex-col gap-3">
          <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
            Farm Address: <span className="text-red-500">*</span>
          </div>
          <div className="relative">
            {isLoadingAddresses ? (
              <div className="h-12 px-6 py-3 bg-black/5 rounded-[30px] flex items-center text-gray-500">
                Loading addresses...
              </div>
            ) : farmAddresses.length === 0 ? (
              <div className="h-12 px-6 py-3 bg-yellow-50 rounded-[30px] flex items-center text-yellow-700 text-sm">
                No farm addresses found. Please create one first.
              </div>
            ) : (
              <select
                value={formData.farmAddress}
                onChange={(e) => handleFieldChange('farmAddress', e.target.value)}
                className="w-full h-12 px-6 py-3 bg-black/5 rounded-[30px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular'] appearance-none cursor-pointer"
              >
                <option value="">Select an address</option>
                {farmAddresses.map((addr) => (
                  <option key={addr._id} value={addr._id}>
                    {addr.addressName} - {addr.city}, {addr.state}
                  </option>
                ))}
              </select>
            )}
            {!isLoadingAddresses && farmAddresses.length > 0 && (
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <img src="/chevron-down-2.svg" alt="Dropdown" className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="w-[474px] mb-5 flex gap-4">
          <div className="flex-1 flex flex-col gap-3">
            <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
              Harvest Date:
            </div>
            <input
              type="date"
              value={formData.harvestDate}
              onChange={(e) => handleFieldChange('harvestDate', e.target.value)}
              className="h-12 px-6 py-3 bg-black/5 rounded-[30px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular']"
            />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
              Expiry Date:
            </div>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
              className="h-12 px-6 py-3 bg-black/5 rounded-[30px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular']"
            />
          </div>
        </div>

        {/* Organic Certified */}
        <div className="w-[474px] mb-5 flex items-center gap-3">
          <input
            type="checkbox"
            id="organicCertified"
            checked={formData.organicCertified}
            onChange={(e) => handleFieldChange('organicCertified', e.target.checked)}
            className="w-5 h-5 accent-brand-colors-SproutGreen"
          />
          <label
            htmlFor="organicCertified"
            className="text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium'] cursor-pointer"
          >
            Organic Certified
          </label>
        </div>

        {/* Tags */}
        <div className="w-[474px] mb-20 flex flex-col gap-3">
          <div className="px-2.5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Medium']">
            Tags: <span className="text-sm text-gray-500">(comma separated)</span>
          </div>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleFieldChange('tags', e.target.value)}
            className="h-12 px-6 py-3 bg-black/5 rounded-[30px] outline outline-2 outline-offset-[-2px] outline-black/5 text-brand-colors-RootBlack text-base font-['MadaniArabic-Regular']"
            placeholder="organic, fresh, local"
          />
        </div>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 flex items-center justify-center px-5">
        <div className="bg-white/20 rounded-full p-2.5 flex items-center gap-1.5">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving || isUploadingImage}
            className="w-48 min-w-40 min-h-10 px-6 py-3 bg-brand-colors-SproutGreen rounded-[30px] flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="text-brand-colors-SteamWhite text-base font-['MadaniArabic-Bold']">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </span>
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="p-2.5 bg-brand-colors-SteamWhite rounded-3xl shadow-[0px_4px_30px_5px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-red-50 transition-colors group disabled:opacity-50"
          >
            <img
              src="/delete icon.svg"
              alt="Cancel"
              className="w-5 h-5 group-hover:opacity-80"
              style={{ filter: 'invert(23%) sepia(89%) saturate(7495%) hue-rotate(4deg) brightness(101%) contrast(107%)' }}
            />
          </button>
        </div>
      </div>

      {/* Custom Scroll Indicator */}
      <div className="w-[5px] h-[500px] right-[10px] top-[100px] absolute bg-gray-200 rounded-full z-10">
        <div
          className="w-[5px] h-14 bg-brand-colors-SproutGreen rounded-full transition-all duration-150"
          style={{
            transform: `translateY(${scrollPosition * (500 - 56)}px)`
          }}
        ></div>
      </div>
    </div>
  );
};

export default EditListingView;