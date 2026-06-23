export type CustomerRole = 'host' | 'guest';

export type MenuStockStatus = 'available' | 'sold_out';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'beverage' | 'snack';
  imageUrl?: string;
  glbModelUrl?: string;
  stockStatus: MenuStockStatus;
  isActive: boolean;
}

export interface CartItem {
  menuId: string;
  name: string;
  price: number;
  qty: number;
  addedBy: CustomerRole;
}

export interface SessionData {
  sessionId: string;
  tableId: string;
  tableNumber: string;
  role: CustomerRole;
  hostToken?: string;
}

export interface OrderItemInput {
  menuId: string;
  menuName: string;
  price: number;
  qty: number;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    tableNumber: string;
    totalAmount: number;
    paymentStatus: string;
    paymentRedirectUrl: string;
  };
}
