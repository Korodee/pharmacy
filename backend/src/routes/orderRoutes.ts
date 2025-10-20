import express from 'express';
import { createOrder, getAllOrders, getOrderById } from '../controllers/orderController';

const router = express.Router();

// POST /api/orders - Create a new order
router.post('/', createOrder);

// GET /api/orders - Get all orders (with pagination)
router.get('/', getAllOrders);

// GET /api/orders/:id - Get a single order by ID
router.get('/:id', getOrderById);

export default router;
