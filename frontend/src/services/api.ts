import axios from 'axios';
import { 
  User, Product, Category, Unit, Order, DashboardStats, 
  AuthUser, OrderStatus, DeliveryStatus 
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (email: string, password: string) =>
  api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });

export const getMe = () => api.get<AuthUser>('/auth/me');

// Users
export const getUsers = () => api.get<User[]>('/users');
export const createUser = (data: Partial<User>) => api.post<User>('/users', data);
export const updateUser = (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);

// Products
export const getProducts = (page?: number, limit?: number) =>
  api.get<{ data: Product[]; total: number; page: number; pages: number }>('/products', { params: { page, limit } });
export const getPublicProducts = () => api.get<Product[]>('/products/public');
export const createProduct = (data: FormData) =>
  api.post<Product>('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id: number, data: FormData) =>
  api.put<Product>(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id: number) => api.delete(`/products/${id}`);

// Categories
export const getCategories = () => api.get<Category[]>('/categories');
export const createCategory = (data: { name: string }) => api.post<Category>('/categories', data);
export const updateCategory = (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data);
export const deleteCategory = (id: number) => api.delete(`/categories/${id}`);

// Units
export const getUnits = () => api.get<Unit[]>('/units');
export const createUnit = (data: { name: string }) => api.post<Unit>('/units', data);
export const updateUnit = (id: number, data: Partial<Unit>) => api.put<Unit>(`/units/${id}`, data);
export const deleteUnit = (id: number) => api.delete(`/units/${id}`);

// Orders
export const getOrders = (page?: number, limit?: number) =>
  api.get<{ data: Order[]; total: number; page: number; pages: number }>('/orders', { params: { page, limit } });
export const getOrderById = (id: number) => api.get<Order>(`/orders/${id}`);
export const getOrderByToken = (token: string) => api.get<Order>(`/orders/approval/${token}`);
export const createOrder = (data: { clientName: string; phone: string; responsible: string; address: string; items: { productId: number; qty: number }[] }) => 
  api.post<Order>('/orders', data);
export const approveOrder = (token: string) => api.patch<Order>(`/orders/approval/${token}/approve`);
export const rejectOrder = (token: string) => api.patch<Order>(`/orders/approval/${token}/reject`);
export const updateDeliveryStatus = (id: number, deliveryStatus: string) =>
  api.patch<Order>(`/orders/${id}/delivery-status`, { deliveryStatus });

// Dashboard
export const getDashboardStats = () => api.get<DashboardStats>('/dashboard/stats');

