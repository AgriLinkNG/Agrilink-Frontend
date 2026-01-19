// Listings API Types - Matching NestJS Backend DTOs

// ==================== Enums ====================

export type ProductCategory =
  | 'fruits'
  | 'vegetables'
  | 'grains'
  | 'legumes'
  | 'herbs'
  | 'spices'
  | 'dairy'
  | 'poultry'
  | 'livestock'
  | 'others';

export type UnitOfMeasurement =
  | 'kg'
  | 'gram'
  | 'pound'
  | 'litre'
  | 'piece'
  | 'dozen'
  | 'bag'
  | 'crate';

export type ListingStatus =
  | 'active'
  | 'inactive'
  | 'out_of_stock'
  | 'archived';

// ==================== Product Image ====================

export interface ProductImage {
  url: string;
  filename: string;
  alt?: string;
  isPrimary: boolean;
}

// ==================== Farm Address ====================

export interface FarmAddress {
  _id: string;
  farmerId: string;
  addressName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarmAddressRequest {
  addressName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
}

export interface UpdateFarmAddressRequest {
  addressName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  landmark?: string;
  isActive?: boolean;
}

// ==================== Listing ====================

export interface Listing {
  _id: string;
  farmerId: string;
  produceName: string;
  produceDescription: string;
  category: ProductCategory;
  unitPrice: number;
  unitOfMeasurement: UnitOfMeasurement;
  quantityAvailable: number;
  minimumOrderQuantity: number;
  farmAddress: string | FarmAddress;
  images: ProductImage[];
  harvestDate?: string;
  expiryDate?: string;
  organicCertified: boolean;
  tags: string[];
  status: ListingStatus;
  viewCount: number;
  inquiryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingRequest {
  produceName: string;
  produceDescription: string;
  category: ProductCategory;
  unitPrice: number;
  unitOfMeasurement: UnitOfMeasurement;
  quantityAvailable: number;
  minimumOrderQuantity: number;
  farmAddress: string; // Address ID
  images: ProductImage[];
  harvestDate?: string;
  expiryDate?: string;
  organicCertified?: boolean;
  tags?: string[];
}

export interface UpdateListingRequest {
  produceName?: string;
  produceDescription?: string;
  category?: ProductCategory;
  unitPrice?: number;
  unitOfMeasurement?: UnitOfMeasurement;
  quantityAvailable?: number;
  minimumOrderQuantity?: number;
  farmAddress?: string;
  images?: ProductImage[];
  harvestDate?: string;
  expiryDate?: string;
  organicCertified?: boolean;
  tags?: string[];
  status?: ListingStatus;
}

// ==================== API Response Types ====================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListingsResponse {
  listings: Listing[];
  pagination: PaginationInfo;
}

export interface ListingAnalytics {
  viewCount: number;
  inquiryCount: number;
  createdAt: string;
  status: ListingStatus;
  daysActive: number;
}

// ==================== Query Parameters ====================

export interface GetListingsParams {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  status?: ListingStatus;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  farmerId?: string;
  state?: string;
  organicCertified?: boolean;
}

// ==================== Image Upload Response ====================

export interface ImageUploadResponse {
  images: ProductImage[];
}

// ==================== Bulk Operations ====================

export interface BulkStatusUpdateRequest {
  listingIds: string[];
  status: ListingStatus;
}

// ==================== Category Display Names ====================

export const CATEGORY_DISPLAY_NAMES: Record<ProductCategory, string> = {
  fruits: 'Fruits',
  vegetables: 'Vegetables',
  grains: 'Grains',
  legumes: 'Legumes',
  herbs: 'Herbs',
  spices: 'Spices',
  dairy: 'Dairy',
  poultry: 'Poultry',
  livestock: 'Livestock',
  others: 'Others',
};

export const UNIT_DISPLAY_NAMES: Record<UnitOfMeasurement, string> = {
  kg: 'Kilogram (kg)',
  gram: 'Gram',
  pound: 'Pound',
  litre: 'Litre',
  piece: 'Piece',
  dozen: 'Dozen',
  bag: 'Bag',
  crate: 'Crate',
};

export const STATUS_DISPLAY_NAMES: Record<ListingStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  out_of_stock: 'Out of Stock',
  archived: 'Archived',
};
