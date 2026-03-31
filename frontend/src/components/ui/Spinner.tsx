interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'dark' | 'blue';
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };
const colors = { white: 'border-white/30 border-t-white', dark: 'border-slate-200 border-t-slate-600', blue: 'border-blue-100 border-t-blue-600' };

export default function Spinner({ size = 'md', color = 'blue' }: SpinnerProps) {
  return (
    <div className={`${sizes[size]} ${colors[color]} border-2 rounded-full animate-spin flex-shrink-0`} />
  );
}
