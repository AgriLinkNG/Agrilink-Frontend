// Response Normalizer Utility
// Handle variations in backend response structures

import { Listing } from '@/types/listings';
import { ApiRequestError } from '@/services/api';

/**
 * Normalize listing response from backend
 * Handles different response structures and ensures consistent format
 */
export function normalizeListingResponse(response: any): Listing {
  // Handle nested data structures
  // Backend might return: { data: { data: Listing } } or { data: Listing } or just Listing
  let listing: any;

  if (response?.data?.data) {
    // Nested structure: { data: { data: Listing } }
    listing = response.data.data;
  } else if (response?.data) {
    // Single nested: { data: Listing }
    listing = response.data;
  } else if (response?._id) {
    // Direct listing object
    listing = response;
  } else {
    throw new Error('Invalid listing response structure');
  }

  // Validate required fields
  if (!listing._id) {
    throw new Error('Listing response missing required field: _id');
  }

  // Normalize field names if backend uses different conventions
  return {
    _id: listing._id || listing.id,
    farmerId: listing.farmerId || listing.farmer_id || listing.userId,
    produceName: listing.produceName || listing.produce_name || listing.name,
    produceDescription: listing.produceDescription || listing.produce_description || listing.description,
    category: listing.category,
    unitPrice: listing.unitPrice || listing.unit_price || listing.price,
    unitOfMeasurement: listing.unitOfMeasurement || listing.unit_of_measurement || listing.unit,
    quantityAvailable: listing.quantityAvailable || listing.quantity_available || listing.quantity || 0,
    minimumOrderQuantity: listing.minimumOrderQuantity || listing.minimum_order_quantity || listing.minOrder || 1,
    farmAddress: listing.farmAddress || listing.farm_address || listing.address,
    images: normalizeImages(listing.images || []),
    status: listing.status || 'active',
    viewCount: listing.viewCount || listing.view_count || 0,
    inquiryCount: listing.inquiryCount || listing.inquiry_count || 0,
    harvestDate: listing.harvestDate || listing.harvest_date,
    expiryDate: listing.expiryDate || listing.expiry_date,
    organicCertified: listing.organicCertified || listing.organic_certified || false,
    tags: listing.tags || [],
    createdAt: listing.createdAt || listing.created_at || new Date().toISOString(),
    updatedAt: listing.updatedAt || listing.updated_at || new Date().toISOString(),
  };
}

/**
 * Normalize image array
 */
function normalizeImages(images: any[]): any[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.map((img, index) => ({
    url: img.url || img.imageUrl || img.src,
    filename: img.filename || img.file_name || img.name,
    alt: img.alt || img.altText || `Product image ${index + 1}`,
    isPrimary: img.isPrimary || img.is_primary || index === 0,
  }));
}

/**
 * Normalize array of listings
 */
export function normalizeListingsResponse(response: any): Listing[] {
  // Handle different response structures
  let listings: any[];

  if (Array.isArray(response)) {
    listings = response;
  } else if (response?.data?.listings) {
    listings = response.data.listings;
  } else if (response?.listings) {
    listings = response.listings;
  } else if (response?.data && Array.isArray(response.data)) {
    listings = response.data;
  } else {
    console.warn('Unexpected listings response structure:', response);
    return [];
  }

  return listings.map(normalizeListingResponse);
}

/**
 * Normalize error response from backend
 */
export function normalizeErrorResponse(response: any): ApiRequestError {
  const message = extractErrorMessage(response);
  const status = response?.status || response?.statusCode || response?.code || 0;
  const errors = extractValidationErrors(response);

  return new ApiRequestError(message, status, errors);
}

/**
 * Extract error message from various response formats
 */
export function extractErrorMessage(response: any): string {
  // Try different possible error message locations
  if (typeof response === 'string') {
    return response;
  }

  if (response?.message) {
    return response.message;
  }

  if (response?.error?.message) {
    return response.error.message;
  }

  if (response?.data?.message) {
    return response.data.message;
  }

  if (response?.errors && typeof response.errors === 'string') {
    return response.errors;
  }

  // If there are validation errors, create a summary message
  const validationErrors = extractValidationErrors(response);
  if (validationErrors && Object.keys(validationErrors).length > 0) {
    const errorCount = Object.keys(validationErrors).length;
    return `Validation failed with ${errorCount} error(s)`;
  }

  return 'An error occurred';
}

/**
 * Extract validation errors from response
 */
export function extractValidationErrors(response: any): Record<string, string[]> | undefined {
  // Try different possible validation error locations
  if (response?.errors && typeof response.errors === 'object' && !Array.isArray(response.errors)) {
    return normalizeValidationErrors(response.errors);
  }

  if (response?.validationErrors) {
    return normalizeValidationErrors(response.validationErrors);
  }

  if (response?.data?.errors && typeof response.data.errors === 'object') {
    return normalizeValidationErrors(response.data.errors);
  }

  return undefined;
}

/**
 * Normalize validation errors to consistent format
 * Handles: { field: "error" }, { field: ["error1", "error2"] }, { field: { message: "error" } }
 */
function normalizeValidationErrors(errors: any): Record<string, string[]> {
  const normalized: Record<string, string[]> = {};

  for (const [field, value] of Object.entries(errors)) {
    if (typeof value === 'string') {
      normalized[field] = [value];
    } else if (Array.isArray(value)) {
      normalized[field] = value.map(v => (typeof v === 'string' ? v : v.message || String(v)));
    } else if (value && typeof value === 'object') {
      normalized[field] = [(value as any).message || String(value)];
    }
  }

  return normalized;
}

/**
 * Validate response structure matches expected type
 */
export function validateResponseStructure(response: any, expectedType: 'listing' | 'listings'): boolean {
  if (!response) {
    return false;
  }

  if (expectedType === 'listing') {
    // Check for listing object with required fields
    const listing = response?.data?.data || response?.data || response;
    return !!listing?._id || !!listing?.id;
  }

  if (expectedType === 'listings') {
    // Check for array of listings
    const listings = response?.data?.listings || response?.listings || response?.data || response;
    return Array.isArray(listings);
  }

  return false;
}

/**
 * Normalize pagination data
 */
export function normalizePaginationData(response: any): any {
  const pagination = response?.meta?.pagination || response?.pagination || response?.data?.pagination;

  if (!pagination) {
    return undefined;
  }

  return {
    page: pagination.current_page || pagination.currentPage || pagination.page || 1,
    limit: pagination.per_page || pagination.perPage || pagination.limit || 10,
    total: pagination.total || 0,
    totalPages: pagination.last_page || pagination.lastPage || pagination.totalPages || 1,
  };
}
