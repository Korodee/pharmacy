import axios from 'axios';
import { Order, CreateOrderRequest, ApiResponse } from '@shared/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Order API functions
export const orderApi = {
  // Create a new order
  createOrder: async (orderData: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  // Get all orders
  getAllOrders: async (page = 1, limit = 10): Promise<ApiResponse<{ orders: Order[]; pagination: any }>> => {
    const response = await api.get(`/api/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get a single order by ID
  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },
};

export default api;
