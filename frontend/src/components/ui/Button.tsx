import { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:-translate-y-0.5 active:scale-95',
  danger: 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/10 hover:shadow-red-500/30 hover:-translate-y-0.5 active:scale-95',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  success: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:scale-95',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs rounded-xl gap-2 font-bold',
  md: 'px-6 py-2.5 text-sm rounded-2xl gap-2.5 font-bold',
  lg: 'px-8 py-3.5 text-base rounded-2xl gap-3 font-black uppercase tracking-tight',
};

export default function Button({
  variant = 'primary', size = 'md', loading, icon, children, disabled, className = '', ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Spinner size="sm" color={variant === 'secondary' || variant === 'ghost' ? 'dark' : 'white'} /> : icon}
      {children}
    </button>
  );
}
