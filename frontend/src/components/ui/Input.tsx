import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, name, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const inputName = name || inputId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={inputId} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
        <div className="relative flex items-center group">
          {leftIcon && <span className="absolute left-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            name={inputName}
            className={`w-full bg-white border border-slate-200 text-sm py-3 outline-none transition-all placeholder:text-slate-400 rounded-2xl ${leftIcon ? 'pl-11' : 'pl-5'} ${rightIcon ? 'pr-11' : 'pr-5'} focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 ${error ? 'border-red-400 focus:ring-red-500/10' : ''} ${className}`}
            {...props}
          />
          {rightIcon && <span className="absolute right-4 text-slate-400 transition-colors">{rightIcon}</span>}
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
        {hint && !error && <p className="text-[10px] font-medium text-slate-400 ml-1">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
