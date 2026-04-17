import { Order } from '../../../types';
import { FileText, User, Phone, UserCheck, MapPin, Check, Copy } from 'lucide-react';

interface OrderResultProps {
  order: Order;
  copied: boolean;
  onCopy: () => void;
  onDownloadPDF: () => void;
}

export default function OrderResult({ order, copied, onCopy, onDownloadPDF }: OrderResultProps) {
  return (
    <div className="ml-14 mr-4 space-y-8 animate-reveal pb-24">
      <div className="card-premium overflow-hidden !rounded-[3rem] relative group border-none shadow-premium">
        <div className="bg-[#020617] p-10 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/5 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />
          
          <div className="relative flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
                 <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Cotação Ativa</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter leading-none">Nº <span className="text-blue-500">#{order.id}</span></h2>
              <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest pt-1">
                <span>Criado em {new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="text-right">
               <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-4 ml-auto group-hover:scale-110 transition-transform duration-500">
                  <FileText className="w-7 h-7 text-blue-400" />
               </div>
               <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest leading-none mb-1">Validade Máxima</p>
               <p className="font-black text-base text-slate-100">{new Date(order.validUntil).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
        
        <div className="p-10 space-y-10 bg-white">
          <div className="grid grid-cols-2 gap-y-8 gap-x-10">
            {[
              { label: 'Identificação', value: order.clientName, icon: User },
              { label: 'Contato Tel', value: order.phone, icon: Phone },
              { label: 'Responsável', value: order.responsible, icon: UserCheck },
              { label: 'Local Entrega', value: order.address, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 uppercase text-[9px] font-black tracking-[0.2em]">
                  <Icon className="w-3 h-3" /> {label}
                </div>
                <p className="font-extrabold text-slate-900 text-[15px] truncate">{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4">
             <div className="flex items-center justify-between px-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detalhamento Técnico</p>
               <div className="h-px flex-1 bg-slate-100 mx-4" />
             </div>
             <div className="bg-slate-50/50 rounded-[2.5rem] p-6 space-y-4 border border-slate-100">
               {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-800 transition-colors">{item.productName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.qty} {item.unitName} × R$ {item.price.toFixed(2)}</p>
                  </div>
                  <span className="font-black text-slate-900 tabular-nums">R$ {item.subtotal.toFixed(2)}</span>
                </div>
               ))}
               <div className="border-t border-slate-200/60 pt-6 mt-2 flex justify-between items-end">
                 <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Bruto</span>
                    <p className="text-[10px] text-emerald-600 font-bold">Impostos e Taxas Inclusos</p>
                 </div>
                 <span className="text-3xl font-black text-blue-600 tracking-tighter tabular-nums">R$ {order.total.toFixed(2)}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <button onClick={onCopy} className="flex-1 bg-white border border-slate-200 text-slate-800 py-5 rounded-[2rem] text-[13px] font-black flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-2xl hover:border-blue-400 hover:text-blue-600 active:scale-95 group">
          {copied ? (
            <><Check className="w-5 h-5 text-emerald-500" /> Copiado com Sucesso</>
          ) : (
            <><Copy className="w-5 h-5 opacity-40 group-hover:text-blue-500 transition-colors" /> Copiar para Clipboard</>
          )}
        </button>
        <button onClick={onDownloadPDF} className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white py-5 rounded-[2rem] text-[13px] font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 group">
          <FileText className="w-5 h-5 text-white/70 group-hover:scale-110 transition-transform" /> 
          Exportar como PDF
        </button>
      </div>
    </div>
  );
}
