// Farm Address service for Agrilink Backend API
import { api } from './api';
import {
  FarmAddress,
  CreateFarmAddressRequest,
  UpdateFarmAddressRequest,
} from '@/types/listings';

export class FarmAddressService {
  private static instance: FarmAddressService;

  static getInstance(): FarmAddressService {
    if (!FarmAddressService.instance) {
      FarmAddressService.instance = new FarmAddressService();
    }
    return FarmAddressService.instance;
  }

  /**
   * Create a new farm address (farmer only)
   */
  async createAddress(data: CreateFarmAddressRequest): Promise<FarmAddress> {
    const response = await api.post<{ data: FarmAddress }>('/listings/addresses', data);

    if (response.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to create address');
  }

  /**
   * Get all farm addresses for the current farmer
   */
  async getAddresses(): Promise<FarmAddress[]> {
    const response = await api.get<{ addresses: FarmAddress[] }>('/listings/addresses');

    if (response.success && response.data?.addresses) {
      return response.data.addresses;
    }

    return [];
  }

  /**
   * Update a farm address
   */
  async updateAddress(id: string, data: UpdateFarmAddressRequest): Promise<FarmAddress> {
    const response = await api.put<{ data: FarmAddress }>(`/listings/addresses/${id}`, data);

    if (response.success && response.data?.data) {
      return response.data.data;
    }

    throw new Error('Failed to update address');
  }

  /**
   * Delete a farm address
   * Note: Cannot delete if address is used in active listings
   */
  async deleteAddress(id: string): Promise<void> {
    const response = await api.delete(`/listings/addresses/${id}`);

    if (!response.success) {
      throw new Error('Failed to delete address. It may be in use by active listings.');
    }
  }
}

// Export singleton instance
export const farmAddressService = FarmAddressService.getInstance();
