/**
 * React Query hooks for Listings CRUD operations
 * Provides centralized state management with caching, optimistic updates, and automatic refetching
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsService } from '@/services/listingsService';
import {
  Listing,
  CreateListingRequest,
  UpdateListingRequest,
  ListingsResponse,
  GetListingsParams,
  ListingStatus,
} from '@/types/listings';

// Query keys for cache management
export const listingsKeys = {
  all: ['listings'] as const,
  lists: () => [...listingsKeys.all, 'list'] as const,
  list: (params?: GetListingsParams) => [...listingsKeys.lists(), params] as const,
  myListings: (params?: GetListingsParams) => [...listingsKeys.all, 'my-listings', params] as const,
  details: () => [...listingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingsKeys.details(), id] as const,
  analytics: (id: string) => [...listingsKeys.all, 'analytics', id] as const,
};

/**
 * Hook to fetch all public listings with pagination and filters
 */
export const useListings = (params?: GetListingsParams) => {
  return useQuery({
    queryKey: listingsKeys.list(params),
    queryFn: () => listingsService.getAllListings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
  });
};

/**
 * Hook to fetch farmer's own listings (authenticated)
 */
export const useMyListings = (params?: GetListingsParams) => {
  return useQuery({
    queryKey: listingsKeys.myListings(params),
    queryFn: () => listingsService.getMyListings(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for own listings)
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single listing by ID
 */
export const useListing = (id: string) => {
  return useQuery({
    queryKey: listingsKeys.detail(id),
    queryFn: () => listingsService.getListing(id),
    enabled: !!id, // Only fetch when id is provided
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch listings by category
 */
export const useListingsByCategory = (category: string, limit?: number) => {
  return useQuery({
    queryKey: ['listings', 'category', category, limit],
    queryFn: () => listingsService.getListingsByCategory(category, limit),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch popular/featured listings
 */
export const usePopularListings = (limit?: number) => {
  return useQuery({
    queryKey: ['listings', 'popular', limit],
    queryFn: () => listingsService.getPopularListings(limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch recent listings
 */
export const useRecentListings = (limit?: number) => {
  return useQuery({
    queryKey: ['listings', 'recent', limit],
    queryFn: () => listingsService.getRecentListings(limit),
    staleTime: 2 * 60 * 1000, // More frequent updates for recent
  });
};

/**
 * Hook to fetch listing analytics
 */
export const useListingAnalytics = (id: string) => {
  return useQuery({
    queryKey: listingsKeys.analytics(id),
    queryFn: () => listingsService.getListingAnalytics(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create a new listing with cache invalidation
 */
export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListingRequest) => listingsService.createListing(data),
    onSuccess: (newListing) => {
      // Invalidate and refetch my listings
      queryClient.invalidateQueries({ queryKey: listingsKeys.all });

      // Optionally add the new listing to cache immediately
      queryClient.setQueryData(listingsKeys.detail(newListing._id), newListing);
    },
    onError: (error) => {
      console.error('Failed to create listing:', error);
    },
  });
};

/**
 * Hook to update a listing with optimistic updates
 */
export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListingRequest }) =>
      listingsService.updateListing(id, data),

    // Optimistic update - update UI before server responds
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: listingsKeys.detail(id) });

      // Snapshot the previous value
      const previousListing = queryClient.getQueryData<Listing>(listingsKeys.detail(id));

      // Optimistically update the cache
      if (previousListing) {
        queryClient.setQueryData<Listing>(listingsKeys.detail(id), {
          ...previousListing,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      // Return context with previous value for rollback
      return { previousListing };
    },

    // Rollback on error
    onError: (error, variables, context) => {
      console.error('Failed to update listing:', error);
      if (context?.previousListing) {
        queryClient.setQueryData(
          listingsKeys.detail(variables.id),
          context.previousListing
        );
      }
    },

    // Invalidate caches on success
    onSuccess: (updatedListing) => {
      // Update the detail cache with server response
      queryClient.setQueryData(listingsKeys.detail(updatedListing._id), updatedListing);

      // Invalidate list queries to refetch with updated data
      queryClient.invalidateQueries({ queryKey: listingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingsKeys.myListings() });
    },
  });
};

/**
 * Hook to delete a listing with optimistic removal
 */
export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingsService.deleteListing(id),

    // Optimistic delete - remove from UI immediately
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: listingsKeys.myListings() });

      // Snapshot previous my listings data
      const previousMyListings = queryClient.getQueryData<ListingsResponse>(
        listingsKeys.myListings()
      );

      // Optimistically remove the listing from my listings cache
      if (previousMyListings) {
        queryClient.setQueryData<ListingsResponse>(listingsKeys.myListings(), {
          ...previousMyListings,
          listings: previousMyListings.listings.filter((l) => l._id !== id),
          pagination: {
            ...previousMyListings.pagination,
            total: previousMyListings.pagination.total - 1,
          },
        });
      }

      return { previousMyListings };
    },

    // Rollback on error
    onError: (error, id, context) => {
      console.error('Failed to delete listing:', error);
      if (context?.previousMyListings) {
        queryClient.setQueryData(listingsKeys.myListings(), context.previousMyListings);
      }
    },

    // Invalidate all listing caches on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingsKeys.all });
    },
  });
};

/**
 * Hook to bulk update listing status
 */
export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingIds, status }: { listingIds: string[]; status: ListingStatus }) =>
      listingsService.bulkUpdateStatus({ listingIds, status }),

    onSuccess: () => {
      // Invalidate all listing queries to refetch with new statuses
      queryClient.invalidateQueries({ queryKey: listingsKeys.all });
    },

    onError: (error) => {
      console.error('Failed to bulk update status:', error);
    },
  });
};

/**
 * Hook to record an inquiry on a listing
 */
export const useRecordInquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingsService.recordInquiry(id),

    onSuccess: (_, id) => {
      // Invalidate the specific listing to update inquiry count
      queryClient.invalidateQueries({ queryKey: listingsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingsKeys.analytics(id) });
    },
  });
};

/**
 * Utility hook to prefetch a listing (for hover previews, etc.)
 */
export const usePrefetchListing = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: listingsKeys.detail(id),
      queryFn: () => listingsService.getListing(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};
