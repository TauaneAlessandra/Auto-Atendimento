import { Product, CartItem } from '../../../types';
import { Sparkles, ShoppingCart, Minus, Plus, Zap } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  cart: CartItem[];
  onUpdateCart: (product: Product, qty: number) => void;
  onGenerateQuote: () => void;
  loadingOrder: boolean;
  total: number;
}

export default function ProductCatalog({ 
  products, 
  cart, 
  onUpdateCart, 
  onGenerateQuote, 
  loadingOrder, 
  total 
}: ProductCatalogProps) {
  const getQty = (id: number) => cart.find((i) => i.product.id === id)?.qty ?? 0;

  return (
    <div className="ml-14 mr-4 space-y-6 animate-reveal pb-12">
      <div className="flex items-center gap-3 mb-2 px-2">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seleção de Serviços</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {products.map((p) => {
          const qty = getQty(p.id);
          const isActive = qty > 0;
          return (
            <div key={p.id} className={`group transition-all duration-500 rounded-[2.5rem] p-5 bg-white flex gap-5 items-center border ${isActive ? 'border-blue-500/50 shadow-2xl shadow-blue-500/10 scale-[1.02]' : 'border-slate-200/60 shadow-sm hover:border-blue-300 hover:shadow-xl'}`}>
              <div className="relative">
                {p.photo ? (
                  <img src={`/uploads/${p.photo}`} alt={p.name} loading="lazy" className="w-20 h-20 rounded-3xl object-cover shadow-md group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-blue-50 transition-colors duration-500">
                    <ShoppingCart className="w-8 h-8 opacity-20" />
                  </div>
                )}
                {isActive && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-[11px] font-black shadow-lg border-4 border-white animate-reveal">
                    {qty}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.1em] mb-1">{p.category.name}</p>
                <h3 className="font-extrabold text-slate-900 leading-tight mb-1 truncate text-base">{p.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 font-bold text-lg">R$ {p.price.toFixed(2)}</span>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">/ {p.unit.name}</span>
                </div>
              </div>

              <div className="flex items-center bg-slate-100/50 rounded-2xl p-1.5 border border-slate-200/50 backdrop-blur-sm">
                <button 
                  onClick={() => onUpdateCart(p, Math.max(0, qty - 1))} 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${qty > 0 ? 'bg-white text-slate-700 hover:bg-red-50 hover:text-red-500 shadow-lg' : 'text-slate-300 cursor-not-allowed'}`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className={`w-10 text-center font-black text-sm ${isActive ? 'text-blue-600 scale-110' : 'text-slate-300'} transition-all`}>
                  {qty}
                </span>
                <button 
                  onClick={() => onUpdateCart(p, Math.min(p.maxQty, qty + 1))} 
                  className="w-10 h-10 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-blue-500/20 active:scale-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="sticky bottom-0 pt-6 pb-2 z-10">
          <button
            onClick={onGenerateQuote}
            disabled={loadingOrder}
            className="w-full bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] font-black flex items-center justify-between transition-all shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-[0.98] group relative overflow-hidden"
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-500">
                 <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-lg tracking-tighter">Finalizar Orçamento</span>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-4 w-px bg-white/10 mx-1" />
              <span className="text-[10px] opacity-50 uppercase font-black tracking-widest mt-1">Total</span>
              <span className="text-2xl font-black tabular-nums">R$ {total.toFixed(2)}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
