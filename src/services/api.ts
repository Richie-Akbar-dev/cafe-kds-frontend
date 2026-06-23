import axios from 'axios';
import { CreateOrderResponse, OrderItemInput } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
});

export interface CreateOrderPayload {
  tableNumber: string;
  items: OrderItemInput[];
  customerLatitude: number;
  customerLongitude: number;
  customerName?: string;
  notes?: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const { data } = await api.post('/orders', payload);
  return data;
}

export async function fetchMenus() {
  const { data } = await api.get('/menus');
  return data.data;
}

export default api;
