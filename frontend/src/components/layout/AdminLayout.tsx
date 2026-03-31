import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { ToastContainer, useToast } from '../ui/Toast';
import { createContext, useContext } from 'react';

type ToastFns = ReturnType<typeof useToast>;
const ToastCtx = createContext<ToastFns>({} as ToastFns);
export const useAdminToast = () => useContext(ToastCtx);

export default function AdminLayout() {
  const toast = useToast();
  return (
    <ToastCtx.Provider value={toast}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
    </ToastCtx.Provider>
  );
}
