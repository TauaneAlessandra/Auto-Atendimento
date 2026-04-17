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
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 relative bg-mesh overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
          
          <Header />
          <main className="flex-1 overflow-y-auto p-10 relative z-10 scroll-smooth">
            <div className="max-w-7xl mx-auto space-y-10 animate-reveal">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />
    </ToastCtx.Provider>
  );
}
