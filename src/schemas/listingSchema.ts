/**
 * Zod validation schemas for Listing forms
 * Enterprise-grade validation with strict rules for Nigerian e-commerce
 * 
 * These schemas match the backend DTOs and provide comprehensive client-side validation
 */
import { z } from 'zod';

// ==================== Regex Patterns for Nigerian Context ====================

// Nigerian phone number patterns
const NIGERIAN_PHONE_REGEX = /^(\+234|0)[789][01]\d{8}$/;

// Common spam/scam patterns to block
const SPAM_PATTERNS = [
  /\b(whatsapp|telegram|call me|text me|dm me)\b/i,
  /\b(\d{10,})\b/, // Phone numbers in description
  /\b(www\.|http|\.com|\.ng)\b/i, // URLs
  /\b(wire transfer|western union|moneygram|bitcoin|crypto)\b/i,
];

// Profanity and inappropriate content filter (basic list)
const INAPPROPRIATE_PATTERNS = [
  /\b(fuck|shit|damn|bastard|idiot)\b/i,
  // Add more as needed
];

// ==================== Custom Validation Functions ====================

/**
 * Validate that text doesn't contain spam/scam indicators
 */
const noSpamContent = (value: string): boolean => {
  return !SPAM_PATTERNS.some((pattern) => pattern.test(value));
};

/**
 * Validate that text doesn't contain inappropriate language
 */
const noInappropriateContent = (value: string): boolean => {
  return !INAPPROPRIATE_PATTERNS.some((pattern) => pattern.test(value));
};

/**
 * Sanitize and trim text input
 */
const sanitizeText = (value: string): string => {
  return value
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

// ==================== Reusable Field Schemas ====================

const produceName = z
  .string()
  .min(3, 'Product name must be at least 3 characters')
  .max(100, 'Product name must be less than 100 characters')
  .transform(sanitizeText)
  .refine(noInappropriateContent, {
    message: 'Product name contains inappropriate content',
  })
  .refine(
    (val) => !/^\d+$/.test(val),
    { message: 'Product name cannot be just numbers' }
  );

const produceDescription = z
  .string()
  .min(20, 'Description must be at least 20 characters for buyer confidence')
  .max(2000, 'Description must be less than 2000 characters')
  .transform(sanitizeText)
  .refine(noSpamContent, {
    message: 'Description contains suspicious content. Please remove phone numbers, URLs, or payment instructions.',
  })
  .refine(noInappropriateContent, {
    message: 'Description contains inappropriate content',
  });

const categorySchema = z.enum(
  ['fruits', 'vegetables', 'grains', 'legumes', 'herbs', 'spices', 'dairy', 'poultry', 'livestock', 'others'],
  {
    errorMap: () => ({ message: 'Please select a valid product category' }),
  }
);

const unitOfMeasurement = z.enum(
  ['kg', 'gram', 'pound', 'litre', 'piece', 'dozen', 'bag', 'crate'],
  {
    errorMap: () => ({ message: 'Please select a valid unit of measurement' }),
  }
);

const unitPrice = z
  .number({
    required_error: 'Price is required',
    invalid_type_error: 'Price must be a number',
  })
  .positive('Price must be greater than zero')
  .min(1, 'Minimum price is ₦1')
  .max(100_000_000, 'Maximum price is ₦100,000,000')
  .refine(
    (val) => Number.isFinite(val) && !Number.isNaN(val),
    { message: 'Please enter a valid price' }
  );

const quantityAvailable = z
  .number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity must be a number',
  })
  .int('Quantity must be a whole number')
  .nonnegative('Quantity cannot be negative')
  .max(1_000_000, 'Maximum quantity is 1,000,000 units');

const minimumOrderQuantity = z
  .number({
    required_error: 'Minimum order quantity is required',
    invalid_type_error: 'Minimum order must be a number',
  })
  .int('Minimum order must be a whole number')
  .min(1, 'Minimum order quantity must be at least 1')
  .max(10_000, 'Maximum minimum order is 10,000 units');

const farmAddressId = z
  .string()
  .min(1, 'Please select a farm address')
  .regex(/^[a-f\d]{24}$/i, 'Invalid farm address selection');

const productImageSchema = z.object({
  url: z
    .string()
    .url('Invalid image URL')
    .refine(
      (url) => url.startsWith('https://') || url.startsWith('/'),
      { message: 'Images must use secure URLs' }
    ),
  filename: z.string().min(1, 'Filename is required'),
  alt: z.string().optional(),
  isPrimary: z.boolean(),
});

const imagesSchema = z
  .array(productImageSchema)
  .min(1, 'At least one product image is required')
  .max(10, 'Maximum 10 images allowed')
  .refine(
    (images) => images.some((img) => img.isPrimary),
    { message: 'Please select a primary image' }
  );

const harvestDate = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      const date = new Date(val);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return date >= oneYearAgo && date <= now;
    },
    { message: 'Harvest date must be within the last year' }
  );

const expiryDate = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      const date = new Date(val);
      const now = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      return date > now && date <= oneYearLater;
    },
    { message: 'Expiry date must be in the future (within 1 year)' }
  );

const tags = z
  .array(z.string().min(2).max(30))
  .max(10, 'Maximum 10 tags allowed')
  .optional()
  .default([]);

const tagsString = z
  .string()
  .transform((val) =>
    val
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length >= 2 && tag.length <= 30)
  )
  .pipe(z.array(z.string()).max(10, 'Maximum 10 tags allowed'));

// ==================== Main Schemas ====================

/**
 * Schema for creating a new listing
 * All required fields validated strictly
 */
export const createListingSchema = z.object({
  produceName,
  produceDescription,
  category: categorySchema,
  unitPrice,
  unitOfMeasurement,
  quantityAvailable,
  minimumOrderQuantity,
  farmAddress: farmAddressId,
  images: imagesSchema,
  harvestDate,
  expiryDate,
  organicCertified: z.boolean().default(false),
  tags,
}).refine(
  (data) => data.minimumOrderQuantity <= data.quantityAvailable,
  {
    message: 'Minimum order quantity cannot exceed available quantity',
    path: ['minimumOrderQuantity'],
  }
);

/**
 * Schema for updating an existing listing
 * All fields optional, but validated when present
 */
export const updateListingSchema = z.object({
  produceName: produceName.optional(),
  produceDescription: produceDescription.optional(),
  category: categorySchema.optional(),
  unitPrice: unitPrice.optional(),
  unitOfMeasurement: unitOfMeasurement.optional(),
  quantityAvailable: quantityAvailable.optional(),
  minimumOrderQuantity: minimumOrderQuantity.optional(),
  farmAddress: farmAddressId.optional(),
  images: imagesSchema.optional(),
  harvestDate: harvestDate.optional(),
  expiryDate: expiryDate.optional(),
  organicCertified: z.boolean().optional(),
  tags: tags.optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock', 'archived']).optional(),
}).refine(
  (data) => {
    if (data.minimumOrderQuantity !== undefined && data.quantityAvailable !== undefined) {
      return data.minimumOrderQuantity <= data.quantityAvailable;
    }
    return true;
  },
  {
    message: 'Minimum order quantity cannot exceed available quantity',
    path: ['minimumOrderQuantity'],
  }
);

/**
 * Schema for form data (with string inputs)
 * Transforms and parses string inputs to proper types
 */
export const createListingFormSchema = z.object({
  produceName,
  produceDescription,
  category: categorySchema,
  unitPrice: z.string()
    .min(1, 'Price is required')
    .transform((val) => parseFloat(val.replace(/[₦,]/g, '')))
    .pipe(unitPrice),
  unitOfMeasurement,
  quantityAvailable: z.string()
    .min(1, 'Quantity is required')
    .transform((val) => parseInt(val, 10))
    .pipe(quantityAvailable),
  minimumOrderQuantity: z.string()
    .min(1, 'Minimum order quantity is required')
    .transform((val) => parseInt(val, 10))
    .pipe(minimumOrderQuantity),
  farmAddress: farmAddressId,
  images: imagesSchema,
  harvestDate: z.string().optional(),
  expiryDate: z.string().optional(),
  organicCertified: z.boolean().default(false),
  tags: tagsString,
}).refine(
  (data) => {
    const minOrder = typeof data.minimumOrderQuantity === 'number'
      ? data.minimumOrderQuantity
      : parseInt(String(data.minimumOrderQuantity), 10);
    const quantity = typeof data.quantityAvailable === 'number'
      ? data.quantityAvailable
      : parseInt(String(data.quantityAvailable), 10);
    return minOrder <= quantity;
  },
  {
    message: 'Minimum order quantity cannot exceed available quantity',
    path: ['minimumOrderQuantity'],
  }
);

/**
 * Schema for bulk status update
 */
export const bulkStatusUpdateSchema = z.object({
  listingIds: z
    .array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid listing ID'))
    .min(1, 'Select at least one listing')
    .max(100, 'Maximum 100 listings per bulk operation'),
  status: z.enum(['active', 'inactive', 'out_of_stock', 'archived']),
});

// ==================== Type Exports ====================

export type CreateListingFormData = z.infer<typeof createListingSchema>;
export type UpdateListingFormData = z.infer<typeof updateListingSchema>;
export type BulkStatusUpdateData = z.infer<typeof bulkStatusUpdateSchema>;

// ==================== Validation Utilities ====================

/**
 * Validate a single field without throwing
 */
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { success: true; data: T } | { success: false; error: string } => {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.errors[0]?.message || 'Invalid value' };
};

/**
 * Pre-validate image file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB max

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'Image file is empty' };
  }

  return { valid: true };
};

/**
 * Validate price format
 */
export const validatePrice = (value: string): boolean => {
  const numValue = parseFloat(value.replace(/[₦,]/g, ''));
  return !isNaN(numValue) && numValue > 0 && numValue <= 100_000_000;
};
