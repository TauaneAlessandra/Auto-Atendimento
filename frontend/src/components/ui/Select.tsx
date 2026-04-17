import { SelectHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export default function Select({ label, error, children, className = '', id, name, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const selectName = name || selectId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={selectId} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
      <div className="relative flex items-center group">
        <select
          id={selectId}
          name={selectName}
          className={`w-full appearance-none bg-white border border-slate-200 text-sm py-3 pl-5 pr-11 outline-none transition-all rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 ${error ? 'border-red-400 focus:ring-red-500/10' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none w-4 h-4" />
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  );
}
