import { create } from 'zustand';
import { CartItem, CustomerRole, MenuItem, SessionData } from '../types';

interface CartState {
  session: SessionData | null;
  items: CartItem[];
  setSession: (session: SessionData) => void;
  addItem: (menu: MenuItem, role: CustomerRole) => void;
  updateQty: (menuId: string, qty: number) => void;
  removeItem: (menuId: string) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  session: null,
  items: [],

  setSession: (session) => set({ session }),

  addItem: (menu, role) => {
    set((state) => {
      const existing = state.items.find((item) => item.menuId === menu.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.menuId === menu.id ? { ...item, qty: item.qty + 1 } : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            menuId: menu.id,
            name: menu.name,
            price: menu.price,
            qty: 1,
            addedBy: role,
          },
        ],
      };
    });
  },

  updateQty: (menuId, qty) => {
    set((state) => {
      if (qty <= 0) {
        return { items: state.items.filter((item) => item.menuId !== menuId) };
      }
      return {
        items: state.items.map((item) =>
          item.menuId === menuId ? { ...item, qty } : item
        ),
      };
    });
  },

  removeItem: (menuId) => {
    set((state) => ({ items: state.items.filter((item) => item.menuId !== menuId) }));
  },

  clearCart: () => set({ items: [] }),

  total: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  itemCount: () => {
    return get().items.reduce((sum, item) => sum + item.qty, 0);
  },
}));
