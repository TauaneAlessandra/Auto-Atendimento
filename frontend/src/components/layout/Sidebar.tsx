import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, Settings, Users, MessageSquare, Bot } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produtos', icon: Package },
  { to: '/admin/orders', label: 'Cotações', icon: ClipboardList },
  { to: '/admin/users', label: 'Usuários', icon: Users },
  { to: '/admin/settings', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-[#020617] text-white flex flex-col flex-shrink-0 border-r border-slate-800/40 relative z-50">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600/5 blur-[100px] pointer-events-none" />
      
      {/* Logo */}
      <div className="px-8 py-10 relative">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500 ease-out">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="font-black text-xl text-white tracking-tighter leading-none">SmartFlow</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">Enterprise AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-10 overflow-y-auto relative scrollbar-none">
        <div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] px-4 mb-6 opacity-80">Gestão Principal</p>
          <div className="space-y-1.5">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                  }`
                }
              >
                <Icon className={`w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110`} />
                <span>{label}</span>
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 transition-opacity group-active:opacity-100" />
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* User Status / Bottom Action */}
      <div className="p-6 mt-auto">
        <NavLink
          to="/chat"
          className="flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-[13px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 shadow-lg"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Abrir Chat de Vendas</span>
        </NavLink>
      </div>
    </aside>
  );
}
