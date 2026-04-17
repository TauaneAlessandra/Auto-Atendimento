import { Bot, LogOut } from 'lucide-react';

interface ChatHeaderProps {
  onLogout: () => void;
}

export default function ChatHeader({ onLogout }: ChatHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-11 h-11 bg-gradient-to-tr from-blue-700 to-indigo-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white overflow-hidden">
             <Bot className="w-6 h-6 text-white animate-float" />
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>
        <div>
          <h1 className="font-extrabold text-slate-800 tracking-tight leading-none text-base flex items-center gap-2">
            Luna <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI</span>
          </h1>
          <p className="text-slate-400 text-[11px] font-medium mt-0.5">Sempre online para você</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onLogout} 
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 p-2.5 rounded-2xl hover:bg-red-50 transition-all group"
          title="Sair"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  );
}
