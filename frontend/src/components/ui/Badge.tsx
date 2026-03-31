type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-red-50 text-red-600 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  gray: 'bg-slate-50 text-slate-500 border border-slate-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
};

const dots: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500',
  info: 'bg-blue-500', gray: 'bg-slate-400', purple: 'bg-purple-500',
};

export default function Badge({ variant = 'gray', children, dot }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />}
      {children}
    </span>
  );
}
