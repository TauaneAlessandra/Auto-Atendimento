import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../../services/api';
import { DashboardStats } from '../../../types';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import Badge from '../../../components/ui/Badge';
import { ClipboardList, CheckCircle, Clock, XCircle, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const StatCard = ({ label, value, icon: Icon, colorClass, badgeVariant, sub }: {
  label: string; value: string | number; icon: React.ElementType;
  colorClass: string; badgeVariant?: string; sub?: string;
}) => (
  <Card className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </Card>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 text-sm">Visão geral do sistema de orçamentos</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="OS Hoje" value={stats.today} icon={Calendar} colorClass="bg-blue-500" />
        <StatCard label="OS Este Mês" value={stats.thisMonth} icon={ClipboardList} colorClass="bg-indigo-500" />
        <StatCard label="OS Este Ano" value={stats.thisYear} icon={TrendingUp} colorClass="bg-violet-500" />
        <StatCard label="Valor Total Estimado" value={`R$ ${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} colorClass="bg-emerald-500" />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pendentes', value: stats.pendingOrders, icon: Clock, variant: 'warning' as const, color: 'bg-amber-500' },
          { label: 'Aprovadas', value: stats.approvedOrders, icon: CheckCircle, variant: 'success' as const, color: 'bg-emerald-500' },
          { label: 'Rejeitadas', value: stats.rejectedOrders, icon: XCircle, variant: 'danger' as const, color: 'bg-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>OS por Dia (últimos 30 dias)</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.ordersByDay.slice(-30)} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [v, 'OS']}
                labelFormatter={(l) => `Dia: ${l}`}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle>Valor Estimado por Mês (R$)</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.ordersByMonth}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Valor']}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#colorValue)" dot={{ r: 4, fill: '#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
