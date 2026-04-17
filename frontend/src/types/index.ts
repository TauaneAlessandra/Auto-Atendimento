export type UserRole = 'admin' | 'chat';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface Unit {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  categoryId: number;
  description: string;
  unit: Unit;
  unitId: number;
  minQty: number;
  maxQty: number;
  photo?: string;
  active: boolean;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type DeliveryStatus = 'em_andamento' | 'concluido' | 'pausado';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitName: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: number;
  clientName: string;
  phone: string;
  responsible: string;
  address: string;
  total: number;
  status: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  validUntil: string;
  approvedAt?: string;
  rejectedAt?: string;
  notes?: string;
  token: string;
  items: OrderItem[];
  createdAt: string;
}

export interface DashboardStats {
  today: number;
  thisMonth: number;
  thisYear: number;
  totalValue: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  ordersByDay: { date: string; count: number; value: number }[];
  ordersByMonth: { month: string; count: number; value: number }[];
  recentOrders: Order[];
  topProducts: { id: number; name: string; photo?: string; qty: number }[];
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date | string;
}
