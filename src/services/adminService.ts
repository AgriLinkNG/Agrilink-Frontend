// Admin service for Team Delta Defenders Backend API
import { api, ApiResponse } from './api';
import { Listing } from '@/types/listings';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'farmer' | 'buyer' | 'admin';
  created_at: string;
  updated_at: string;
  verified: boolean;
  phone_number?: string;
}

export class AdminService {
  private static instance: AdminService;

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Get all users (admin only)
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/admin/users', params);

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      throw error;
    }
  }

  // Remove user (admin only)
  async removeUser(userId: string): Promise<void> {
    try {
      const response = await api.delete(`/admin/users/${userId}`);

      if (!response.success) {
        throw new Error('Failed to remove user');
      }
    } catch (error) {
      throw error;
    }
  }

  // Approve or remove product (admin only)
  async updateProductStatus(productId: string, action: 'approve' | 'remove', data?: {
    reason?: string;
    status?: string;
  }): Promise<Listing> {
    try {
      const response = await api.put<Listing>(`/admin/products/${productId}`, {
        action,
        ...data
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(`Failed to ${action} product`);
    } catch (error) {
      throw error;
    }
  }

  // Get all products for admin review
  async getAllProductsForReview(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<Listing[]> {
    try {
      const response = await api.get<Listing[]>('/admin/products', params);

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      throw error;
    }
  }

  // Get system statistics (admin only)
  async getSystemStats(): Promise<{
    total_users: number;
    total_farmers: number;
    total_buyers: number;
    total_products: number;
    total_orders: number;
    pending_products: number;
  }> {
    try {
      const response = await api.get('/admin/stats');

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch system statistics');
    } catch (error) {
      throw error;
    }
  }

  // Bulk operations
  async bulkUserAction(userIds: string[], action: 'suspend' | 'activate' | 'delete'): Promise<void> {
    try {
      const response = await api.post('/admin/users/bulk', {
        user_ids: userIds,
        action
      });

      if (!response.success) {
        throw new Error(`Failed to ${action} users`);
      }
    } catch (error) {
      throw error;
    }
  }

  // Export data for reporting
  async exportUsers(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/export/users?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export users');
      }

      return await response.blob();
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const adminService = AdminService.getInstance();