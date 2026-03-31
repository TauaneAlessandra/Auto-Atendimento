import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './features/auth/LoginPage';
import ChatPage from './features/chat/ChatPage';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './features/admin/dashboard/DashboardPage';
import ProductsPage from './features/admin/products/ProductsPage';
import OrdersPage from './features/admin/orders/OrdersPage';
import SettingsPage from './features/admin/settings/SettingsPage';
import UsersPage from './features/admin/users/UsersPage';
import ApprovalPage from './features/approval/ApprovalPage';
import { ReactNode } from 'react';
import Spinner from './components/ui/Spinner';

function Guard({ children, adminOnly }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/chat" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  const home = user ? (user.role === 'admin' ? '/admin' : '/chat') : '/login';
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home} /> : <LoginPage />} />
      <Route path="/chat" element={<Guard><ChatPage /></Guard>} />
      <Route path="/aprovacao/:token" element={<ApprovalPage />} />
      <Route path="/admin" element={<Guard adminOnly><AdminLayout /></Guard>}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      <Route path="/" element={<Navigate to={home} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
