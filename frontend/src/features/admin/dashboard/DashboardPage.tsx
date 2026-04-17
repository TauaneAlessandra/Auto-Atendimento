import { useDashboard } from '../../../viewmodels/useDashboard';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import { ClipboardList, CheckCircle, Clock, XCircle, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const StatCard = ({ label, value, icon: Icon, colorClass, sub }: {
  label: string; value: string | number; icon: React.ElementType;
  colorClass: string; sub?: string;
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
  const { stats, loading } = useDashboard();

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!stats) return null;

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Dashboard</h2>
          <p className="text-slate-500 font-medium mt-2">Visão geral do sistema de orçamentos e performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-600 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            Hoje: {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard label="Solicitações Hoje" value={stats.today} icon={Calendar} colorClass="bg-blue-600" />
        <StatCard label="Volume Mensal" value={stats.thisMonth} icon={ClipboardList} colorClass="bg-indigo-600" />
        <StatCard label="Total Anual" value={stats.thisYear} icon={TrendingUp} colorClass="bg-violet-600" />
        <StatCard label="Projeção Financeira" value={`R$ ${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} colorClass="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Histórico de Operações (30 dias)</CardTitle>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Volume Diário</span>
            </div>
          </CardHeader>
          <div className="px-6 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ordersByDay.slice(-30)} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(v) => v.split('-').reverse().slice(0, 2).join('/')} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} allowDecimals={false} dx={-10} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ border: 'none', borderRadius: 16, fontSize: 12, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                  formatter={(v: number) => [v, 'Solicitações']}
                  labelFormatter={(l) => `Data: ${l}`}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Top Produtos Cotados</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6 space-y-6">
            {stats.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 group/item">
                <div className="text-xl font-black text-slate-200 group-hover/item:text-blue-500 transition-colors w-6">0{i + 1}</div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {p.photo ? <img src={`/uploads/${p.photo}`} className="w-full h-full object-cover" /> : <TrendingUp className="w-5 h-5 text-slate-300 m-2.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(p.qty / stats.topProducts[0].qty) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{p.qty}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">COT</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <CardTitle className="px-1 text-slate-400">Distribuição Status</CardTitle>
          {[
            { label: 'Aguardando Análise', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-500', text: 'text-amber-600' },
            { label: 'Aprovadas pelo Cliente', value: stats.approvedOrders, icon: CheckCircle, color: 'bg-emerald-500', text: 'text-emerald-600' },
            { label: 'Rejeitadas / Canceladas', value: stats.rejectedOrders, icon: XCircle, color: 'bg-red-500', text: 'text-red-600' },
          ].map(({ label, value, icon: Icon, color, text }) => (
            <Card key={label} className="flex items-center gap-5 group transition-all hover:bg-slate-50 border-slate-100">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5 ${color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
              </div>
              <Icon className={`w-8 h-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${text}`} />
            </Card>
          ))}
        </div>

        <div className="xl:col-span-2 space-y-6">
          <CardTitle className="px-1 text-slate-400">Atividades Recentes</CardTitle>
          <Card padding={false} className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Valor</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{o.clientName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{o.address}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 font-black text-slate-900">R$ {o.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        o.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        o.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {o.status === 'approved' ? 'Aprovado' : o.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}
