import { useAuth } from '../../context/AuthContext';
import { LogOut, User, ChevronDown, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="h-20 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 px-10 flex items-center justify-between sticky top-0 z-40 transition-all">
      <div className="flex flex-col">
        <h2 className="text-xl font-black text-slate-800 tracking-tighter leading-none">Gestão Central</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Dashboard v2.0</p>
      </div>
      
      <div className="flex items-center gap-5">
        <button className="w-11 h-11 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-100 hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5 relative group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="w-px h-8 bg-slate-200 mx-2" />

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-4 pl-4 pr-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group"
          >
            <div className="flex flex-col text-right">
              <p className="text-sm font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors uppercase tracking-tight">{user?.name}</p>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-70">{user?.role === 'admin' ? 'Acesso Total' : 'Operador'}</p>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-slate-50 to-slate-200 border border-slate-200 rounded-2xl flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-slate-200 transition-all duration-300">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${open ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-4 w-64 bg-white rounded-[2rem] border border-slate-200/60 shadow-2xl p-2 z-50 animate-slide-up-fancy origin-top-right">
              <div className="px-6 py-5 mb-2 border-b border-slate-50 bg-slate-50/50 rounded-t-[1.8rem]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 opacity-60">Sua Conta</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 leading-none">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">{user?.role}</p>
                  </div>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <button className="w-full text-left text-[13px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all">Perfil do Usuário</button>
                <button className="w-full text-left text-[13px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all">Segurança</button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-black text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sair do Sistema
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
