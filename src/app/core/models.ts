export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED';

export interface Category {
  id: number;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuAddOn {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  prepMinutes: number;
  addOns: MenuAddOn[];
  tags: string[];
}

export interface RestaurantTable {
  id: number;
  tableNumber: string;
  isActive: boolean;
  seats: number;
}

export interface CartItem {
  cartId: string;
  menuItemId: number;
  itemNameSnapshot: string;
  priceSnapshot: number;
  imageUrl: string;
  quantity: number;
  notes: string;
  addOns: MenuAddOn[];
  subtotal: number;
}

export interface OrderItem {
  menuItemId: number;
  itemNameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  notes: string;
  addOns: MenuAddOn[];
  subtotal: number;
}

export interface Order {
  orderNumber: string;
  tableNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  serviceCharge: number;
  totalAmount: number;
  customerNote: string;
  createdAt: string;
}

export interface MenuPayload {
  categories: Category[];
  items: MenuItem[];
}
