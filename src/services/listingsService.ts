// Listings service for Agrilink Backend API
import { api, ApiResponse } from './api';
import { normalizeListingResponse, normalizeListingsResponse } from '../lib/responseNormalizer';
import {
  Listing,
  CreateListingRequest,
  UpdateListingRequest,
  ListingsResponse,
  ListingAnalytics,
  GetListingsParams,
  BulkStatusUpdateRequest,
} from '@/types/listings';

export class ListingsService {
  private static instance: ListingsService;

  static getInstance(): ListingsService {
    if (!ListingsService.instance) {
      ListingsService.instance = new ListingsService();
    }
    return ListingsService.instance;
  }

  // ==================== Public Browsing Endpoints ====================

  /**
   * Browse all active products (public endpoint)
   */
  async getAllListings(params?: GetListingsParams): Promise<ListingsResponse> {
    const response = await api.get<ListingsResponse>('/listings', params);

    if (response.success && response.data) {
      return response.data;
    }

    return { listings: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }

  /**
   * Get a single listing by ID (public endpoint, increments view count)
   */
  async getListing(id: string): Promise<Listing> {
    const response = await api.get<{ listing: Listing }>(`/listings/${id}`);

    if (response.success && response.data?.listing) {
      return response.data.listing;
    }

    throw new Error('Listing not found');
  }

  /**
   * Get listings by category (public endpoint)
   */
  async getListingsByCategory(category: string, limit?: number): Promise<Listing[]> {
    const response = await api.get<{ listings: Listing[] }>(
      `/listings/category/${category}`,
      limit ? { limit } : undefined
    );

    if (response.success && response.data?.listings) {
      return response.data.listings;
    }

    return [];
  }

  /**
   * Get popular/featured products (public endpoint)
   */
  async getPopularListings(limit?: number): Promise<Listing[]> {
    const response = await api.get<{ listings: Listing[] }>(
      '/listings/featured/popular',
      limit ? { limit } : undefined
    );

    if (response.success && response.data?.listings) {
      return response.data.listings;
    }

    return [];
  }

  /**
   * Get recent products (public endpoint)
   */
  async getRecentListings(limit?: number): Promise<Listing[]> {
    const response = await api.get<{ listings: Listing[] }>(
      '/listings/featured/recent',
      limit ? { limit } : undefined
    );

    if (response.success && response.data?.listings) {
      return response.data.listings;
    }

    return [];
  }

  // ==================== Farmer Dashboard Endpoints ====================

  /**
   * Health check - verify backend is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Use a simple GET request to public endpoint
      const response = await api.get('/listings', { limit: 1 });
      return response.success;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  /**
   * Get farmer's own listings (authenticated)
   */
  async getMyListings(params?: GetListingsParams): Promise<ListingsResponse> {
    const response = await api.get<ListingsResponse>('/listings/my-listings', params);

    if (response.success && response.data) {
      return response.data;
    }

    return { listings: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }

  /**
   * Create a new listing (farmer only)
   */
  async createListing(data: CreateListingRequest): Promise<Listing> {
    const response = await api.post<{ data: Listing }>('/listings', data);

    if (response.success && response.data) {
      // Normalize response to handle different backend response structures
      return normalizeListingResponse(response.data);
    }

    throw new Error('Failed to create listing');
  }

  /**
   * Update an existing listing (farmer only)
   */
  async updateListing(id: string, data: UpdateListingRequest): Promise<Listing> {
    const response = await api.put<{ data: Listing }>(`/listings/${id}`, data);

    if (response.success && response.data) {
      // Normalize response to handle different backend response structures
      return normalizeListingResponse(response.data);
    }

    throw new Error('Failed to update listing');
  }

  /**
   * Delete a listing (farmer only, soft delete)
   */
  async deleteListing(id: string): Promise<void> {
    const response = await api.delete(`/listings/${id}`);

    if (!response.success) {
      throw new Error('Failed to delete listing');
    }
  }

  /**
   * Bulk update listing status (farmer only)
   */
  async bulkUpdateStatus(data: BulkStatusUpdateRequest): Promise<void> {
    const response = await api.put('/listings/bulk-update-status', data);

    if (!response.success) {
      throw new Error('Failed to update listing status');
    }
  }

  /**
   * Get analytics for a specific listing (farmer only)
   */
  async getListingAnalytics(id: string): Promise<ListingAnalytics> {
    const response = await api.get<{ analytics: ListingAnalytics }>(
      `/listings/my-listings/${id}/analytics`
    );

    if (response.success && response.data?.analytics) {
      return response.data.analytics;
    }

    throw new Error('Failed to get listing analytics');
  }

  // ==================== Engagement Endpoints ====================

  /**
   * Record an inquiry on a listing (authenticated users)
   */
  async recordInquiry(id: string): Promise<void> {
    const response = await api.post(`/listings/${id}/inquire`);

    if (!response.success) {
      throw new Error('Failed to record inquiry');
    }
  }
}

// Export singleton instance
export const listingsService = ListingsService.getInstance();
