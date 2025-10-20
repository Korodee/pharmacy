export interface Order {
  _id?: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  message?: string;
  prescription?: string;
  createdAt?: Date;
}

export interface CreateOrderRequest {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  message?: string;
  prescription?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
