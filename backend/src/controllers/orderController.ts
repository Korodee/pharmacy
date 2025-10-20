import { Request, Response } from 'express';
import Order from '../models/Order';
import { sendOrderNotification } from '../utils/email';
import { ApiResponse, CreateOrderRequest } from '../../../shared/types';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData: CreateOrderRequest = req.body;

    // Validate required fields
    if (!orderData.fullName || !orderData.email) {
      res.status(400).json({
        success: false,
        message: 'Full name and email are required'
      } as ApiResponse);
      return;
    }

    // Create new order
    const order = new Order(orderData);
    const savedOrder = await order.save();

    // Send email notification to admin
    try {
      await sendOrderNotification(savedOrder);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      data: savedOrder,
      message: 'Order created successfully'
    } as ApiResponse);

  } catch (error: any) {
    console.error('Error creating order:', error);
    
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: Object.values(error.errors).map((err: any) => err.message).join(', ')
      } as ApiResponse);
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    } as ApiResponse);
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    } as ApiResponse);
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      } as ApiResponse);
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: order
    } as ApiResponse);

  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    } as ApiResponse);
  }
};
