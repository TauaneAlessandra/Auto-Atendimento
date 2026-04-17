import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className = '', id, name, ...props }: TextareaProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const inputName = name || inputId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
      <textarea
        id={inputId}
        name={inputName}
        className={`w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none transition-all resize-none placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 ${error ? 'border-red-400 focus:ring-red-500/10' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  );
}
