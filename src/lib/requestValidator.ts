// Request Validator Utility
// Pre-flight validation of request payloads before sending to backend

import {
  CreateListingRequest,
  ProductImage,
  ProductCategory,
  UnitOfMeasurement,
} from '@/types/listings';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors?: Record<string, string[]>;
}

/**
 * Validate a CreateListingRequest before sending to backend
 */
export function validateListingRequest(data: CreateListingRequest): ValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};

  // Validate required fields
  if (!data.produceName || !data.produceName.trim()) {
    fieldErrors.produceName = ['Product name is required'];
    errors.push('Product name is required');
  } else if (data.produceName.length > 200) {
    fieldErrors.produceName = ['Product name must not exceed 200 characters'];
    errors.push('Product name is too long');
  }

  if (!data.category) {
    fieldErrors.category = ['Category is required'];
    errors.push('Category is required');
  }

  if (!data.produceDescription || !data.produceDescription.trim()) {
    fieldErrors.produceDescription = ['Description is required'];
    errors.push('Description is required');
  } else if (data.produceDescription.length > 2000) {
    fieldErrors.produceDescription = ['Description must not exceed 2000 characters'];
    errors.push('Description is too long');
  }

  // Validate pricing
  const pricingValidation = validatePricing(data.unitPrice);
  if (!pricingValidation.isValid) {
    fieldErrors.unitPrice = pricingValidation.errors;
    errors.push(...pricingValidation.errors);
  }

  // Validate unit of measurement
  const validUnits: UnitOfMeasurement[] = ['kg', 'g', 'lb', 'piece', 'bunch', 'bag', 'crate'];
  if (!validUnits.includes(data.unitOfMeasurement)) {
    fieldErrors.unitOfMeasurement = ['Invalid unit of measurement'];
    errors.push('Invalid unit of measurement');
  }

  // Validate quantities
  if (data.quantityAvailable < 0) {
    fieldErrors.quantityAvailable = ['Quantity available cannot be negative'];
    errors.push('Quantity available cannot be negative');
  }

  if (data.minimumOrderQuantity < 1) {
    fieldErrors.minimumOrderQuantity = ['Minimum order quantity must be at least 1'];
    errors.push('Minimum order quantity must be at least 1');
  }

  if (data.minimumOrderQuantity > data.quantityAvailable) {
    fieldErrors.minimumOrderQuantity = ['Minimum order quantity cannot exceed available quantity'];
    errors.push('Minimum order quantity cannot exceed available quantity');
  }

  // Validate farm address
  if (!data.farmAddress || !data.farmAddress.trim()) {
    fieldErrors.farmAddress = ['Farm address is required'];
    errors.push('Farm address is required');
  }

  // Validate images
  const imagesValidation = validateImages(data.images);
  if (!imagesValidation.isValid) {
    fieldErrors.images = imagesValidation.errors;
    errors.push(...imagesValidation.errors);
  }

  // Validate dates
  const datesValidation = validateDates(data.harvestDate, data.expiryDate);
  if (!datesValidation.isValid) {
    if (data.harvestDate) {
      fieldErrors.harvestDate = datesValidation.errors.filter(e => e.includes('harvest'));
    }
    if (data.expiryDate) {
      fieldErrors.expiryDate = datesValidation.errors.filter(e => e.includes('expiry'));
    }
    errors.push(...datesValidation.errors);
  }

  // Validate tags
  if (data.tags && data.tags.length > 10) {
    fieldErrors.tags = ['Maximum 10 tags allowed'];
    errors.push('Too many tags (max 10)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  };
}

/**
 * Validate product images
 */
export function validateImages(images: ProductImage[]): ValidationResult {
  const errors: string[] = [];

  if (!images || images.length === 0) {
    errors.push('At least one product image is required');
    return { isValid: false, errors };
  }

  if (images.length > 10) {
    errors.push('Maximum 10 images allowed');
  }

  // Check if at least one image is marked as primary
  const hasPrimaryImage = images.some(img => img.isPrimary);
  if (!hasPrimaryImage && images.length > 0) {
    errors.push('One image must be marked as primary');
  }

  // Validate each image
  images.forEach((img, index) => {
    if (!img.url || !img.url.trim()) {
      errors.push(`Image ${index + 1} is missing a URL`);
    } else {
      // Basic URL validation
      try {
        new URL(img.url);
      } catch {
        errors.push(`Image ${index + 1} has an invalid URL`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate pricing
 */
export function validatePricing(unitPrice: number): ValidationResult {
  const errors: string[] = [];

  if (unitPrice === undefined || unitPrice === null) {
    errors.push('Unit price is required');
  } else if (isNaN(unitPrice)) {
    errors.push('Unit price must be a valid number');
  } else if (unitPrice < 0) {
    errors.push('Unit price cannot be negative');
  } else if (unitPrice === 0) {
    errors.push('Unit price must be greater than zero');
  } else if (unitPrice > 10000000) {
    errors.push('Unit price seems unreasonably high (max: 10,000,000)');
  }

  // Check for reasonable decimal places (max 2)
  if (unitPrice && !isNaN(unitPrice)) {
    const decimalPlaces = (unitPrice.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      errors.push('Unit price should have at most 2 decimal places');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate dates
 */
export function validateDates(
  harvestDate?: string,
  expiryDate?: string
): ValidationResult {
  const errors: string[] = [];

  if (harvestDate) {
    const harvest = new Date(harvestDate);
    if (isNaN(harvest.getTime())) {
      errors.push('Invalid harvest date format');
    } else {
      // Harvest date should not be in the far future
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (harvest > oneYearFromNow) {
        errors.push('Harvest date cannot be more than 1 year in the future');
      }
    }
  }

  if (expiryDate) {
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
      errors.push('Invalid expiry date format');
    } else {
      // Expiry date must be in the future
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (expiry < now) {
        errors.push('Expiry date must be in the future');
      }
    }
  }

  // If both dates are provided, expiry should be after harvest
  if (harvestDate && expiryDate) {
    const harvest = new Date(harvestDate);
    const expiry = new Date(expiryDate);
    if (!isNaN(harvest.getTime()) && !isNaN(expiry.getTime())) {
      if (expiry <= harvest) {
        errors.push('Expiry date must be after harvest date');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate category
 */
export function validateCategory(category: string): ValidationResult {
  const errors: string[] = [];

  const validCategories: ProductCategory[] = [
    'vegetables',
    'fruits',
    'grains',
    'dairy',
    'poultry',
    'livestock',
    'other',
  ];

  if (!category) {
    errors.push('Category is required');
  } else if (!validCategories.includes(category as ProductCategory)) {
    errors.push('Invalid category selected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
