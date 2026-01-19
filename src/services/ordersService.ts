// Orders service for Team Delta Defenders Backend API
import { api, ApiResponse } from './api';
import { Listing } from '@/types/listings';

export interface Order {
  id: string;
  buyer_id: string;
  farmer_id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  created_at: string;
  updated_at: string;
  product?: Listing;
  buyer_name?: string;
  farmer_name?: string;
}

export interface CreateOrderRequest {
  product_id: string;
  quantity: number;
  shipping_address: string;
  notes?: string;
}

export class OrdersService {
  private static instance: OrdersService;

  static getInstance(): OrdersService {
    if (!OrdersService.instance) {
      OrdersService.instance = new OrdersService();
    }
    return OrdersService.instance;
  }

  // Create a new order (buyer only)
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    try {
      const response = await api.post<Order>('/orders', data);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to create order');
    } catch (error) {
      throw error;
    }
  }

  // Get order details by ID
  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await api.get<Order>(`/orders/${id}`);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Order not found');
    } catch (error) {
      throw error;
    }
  }

  // Get orders for a specific user
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>(`/orders/user/${userId}`);

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      throw error;
    }
  }

  // Get current user's orders
  async getMyOrders(): Promise<Order[]> {
    try {
      // This would need to be implemented on the backend or use the current user's ID
      const response = await api.get<Order[]>('/orders/my');

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const ordersService = OrdersService.getInstance();