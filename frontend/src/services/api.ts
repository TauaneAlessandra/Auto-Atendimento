import axios from 'axios';

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
      // window.location.href = '/login'; // REMOVED to prevent infinite loops during dev
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

// Users
export const getUsers = () => api.get('/users');
export const createUser = (data: object) => api.post('/users', data);
export const updateUser = (id: number, data: object) => api.put(`/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);

// Products
export const getProducts = () => api.get('/products');
export const getPublicProducts = () => api.get('/products/public');
export const createProduct = (data: FormData) =>
  api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id: number, data: FormData) =>
  api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id: number) => api.delete(`/products/${id}`);

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data: object) => api.post('/categories', data);
export const updateCategory = (id: number, data: object) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id: number) => api.delete(`/categories/${id}`);

// Units
export const getUnits = () => api.get('/units');
export const createUnit = (data: object) => api.post('/units', data);
export const updateUnit = (id: number, data: object) => api.put(`/units/${id}`, data);
export const deleteUnit = (id: number) => api.delete(`/units/${id}`);

// Orders
export const getOrders = () => api.get('/orders');
export const getOrderById = (id: number) => api.get(`/orders/${id}`);
export const getOrderByToken = (token: string) => api.get(`/orders/approval/${token}`);
export const createOrder = (data: object) => api.post('/orders', data);
export const approveOrder = (token: string) => api.patch(`/orders/approval/${token}/approve`);
export const rejectOrder = (token: string) => api.patch(`/orders/approval/${token}/reject`);
export const updateDeliveryStatus = (id: number, deliveryStatus: string) =>
  api.patch(`/orders/${id}/delivery-status`, { deliveryStatus });

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
