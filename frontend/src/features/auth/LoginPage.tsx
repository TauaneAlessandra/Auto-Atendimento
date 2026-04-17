import { useLogin } from '../../viewmodels/useLogin';
import { Mail, Lock, Bot, Sparkles, Shield, Zap } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const features = [
  { icon: Zap, label: 'Orçamentos instantâneos', desc: 'Gere propostas completas em segundos com IA' },
  { icon: Shield, label: 'Aprovação digital', desc: 'Fluxo seguro de aprovação com link único' },
  { icon: Sparkles, label: 'Painel inteligente', desc: 'Dashboard com métricas e relatórios em tempo real' },
];

export default function LoginPage() {
  const vm = useLogin();

  return (
    <div className="min-h-screen bg-[#060d1f] relative overflow-hidden flex">
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-blue-700/15 rounded-full blur-[130px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-700/15 rounded-full blur-[130px] animate-pulse [animation-delay:2.5s]" />
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-cyan-600/8 rounded-full blur-[100px] animate-pulse [animation-delay:1.2s]" />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">SmartFlow</span>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Plataforma de Orçamentos
            </span>
            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
              Orçamentos<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">mais rápidos.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Automatize a criação de orçamentos com IA e controle todo o fluxo de aprovação em um só lugar.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-700 text-xs font-bold uppercase tracking-[0.2em]">Powered by Antigravity Design System</p>
      </div>

      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent my-10 flex-shrink-0" />

      <div className="flex-1 flex items-center justify-center p-6 lg:p-14 relative z-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl items-center justify-center mb-4 shadow-2xl shadow-blue-500/30">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">SmartFlow</h1>
          </div>

          <div className="glass-dark rounded-[2rem] p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white mb-1">Bem-vindo de volta</h2>
              <p className="text-slate-500 text-sm">Entre com suas credenciais para acessar</p>
            </div>

            <form onSubmit={vm.handleSubmit} className="space-y-5">
              {vm.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3.5 rounded-2xl text-sm flex items-center gap-3 animate-slide-up-fancy">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                  <span className="font-medium">{vm.error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">E-mail Corporativo</label>
                <Input id="email" name="email" type="email" value={vm.email} onChange={(e) => vm.setEmail(e.target.value)}
                  placeholder="nome@empresa.com" leftIcon={<Mail className="w-4 h-4 opacity-40" />}
                  className="!bg-white/5 !border-white/10 !text-white !rounded-2xl !py-3.5 focus:!ring-blue-500/40 focus:!border-blue-500/40 !text-sm"
                  autoComplete="email" required />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Senha de Acesso</label>
                <Input id="password" name="password" type="password" value={vm.password} onChange={(e) => vm.setPassword(e.target.value)}
                  placeholder="••••••••" leftIcon={<Lock className="w-4 h-4 opacity-40" />}
                  className="!bg-white/5 !border-white/10 !text-white !rounded-2xl !py-3.5 focus:!ring-blue-500/40 focus:!border-blue-500/40 !text-sm"
                  autoComplete="current-password" required />
              </div>

              <Button type="submit" loading={vm.loading} className="w-full !rounded-2xl !py-3.5 btn-gradient !text-base border-none mt-2">
                Entrar
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
