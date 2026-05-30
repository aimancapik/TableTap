export type OrderStatus = 'AWAITING_PAYMENT' | 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED';
export type OrderType = 'DINE_IN' | 'PACKED_TO_GO' | 'TAKEOUT';
export type PaymentMethod = 'PAY_AT_COUNTER';
export type PaymentStatus = 'UNPAID' | 'PAID';
export type KitchenTicketStatus = 'RECEIVED';

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
  orderType: OrderType;
  tableNumber?: string;
  pickupName?: string;
  pickupPhone?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  serviceCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerNote: string;
  createdAt: string;
  paidAt?: string;
}

export interface KitchenTicket {
  orderNumber: string;
  orderType: OrderType;
  tableNumber?: string;
  pickupName?: string;
  items: OrderItem[];
  customerNote: string;
  status: KitchenTicketStatus;
  receivedAt: string;
}

export interface TableBill {
  tableNumber: string;
  orders: Order[];
  subtotal: number;
  serviceCharge: number;
  totalDue: number;
  itemCount: number;
}

export interface MenuPayload {
  categories: Category[];
  items: MenuItem[];
}
