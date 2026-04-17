import { useEffect, useState } from 'react';
import { getOrders, updateDeliveryStatus } from '../../../services/api';
import { Order, DeliveryStatus } from '../../../types';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import { Eye, Copy, Check, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAdminToast } from '../../../components/layout/AdminLayout';

type StatusKey = 'pending' | 'approved' | 'rejected' | 'expired';

const statusConfig: Record<StatusKey, { label: string; variant: 'warning' | 'success' | 'danger' | 'gray'; icon: React.ElementType }> = {
  pending: { label: 'Pendente', variant: 'warning', icon: Clock },
  approved: { label: 'Aprovado', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rejeitado', variant: 'danger', icon: XCircle },
  expired: { label: 'Expirado', variant: 'gray', icon: AlertCircle },
};

const workStatusOptions = [
  { value: 'em_andamento', label: 'Preparando Pedido' },
  { value: 'pausado', label: 'Aguardando Estoque' },
  { value: 'concluido', label: 'Pronto / Entregue' },
];

export default function OrdersPage() {
  const toast = useAdminToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    getOrders()
      .then((r) => {
        // Handle paginated response structure { data: [], total, ... }
        const orderList = Array.isArray(r.data) ? r.data : (r.data.data || []);
        setOrders(orderList);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleDeliveryStatus = async (orderId: number, ws: string) => {
    try {
      await updateDeliveryStatus(orderId, ws);
      fetchOrders();
      if (selected?.id === orderId) setSelected((p) => p ? { ...p, deliveryStatus: ws as DeliveryStatus } : null);
      toast.success('Status atualizado!');
    } catch { toast.error('Erro ao atualizar status'); }
  };

  const copyLink = (order: Order) => {
    navigator.clipboard.writeText(`${window.location.origin}/aprovacao/${order.token}`);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Link copiado!');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Cotações de Produtos</h2>
        <p className="text-slate-500 text-sm">Todas as cotações geradas pelo chatbot</p>
      </div>

      <Card padding={false}>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {['#', 'Cliente', 'Responsável', 'Endereço', 'Total', 'Status', 'Andamento', 'Data', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => {
                const cfg = statusConfig[o.status as StatusKey];
                return (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-600">#{o.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{o.clientName}</p>
                      <p className="text-xs text-slate-400">{o.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{o.responsible}</td>
                    <td className="px-5 py-3.5 text-slate-600">{o.address}</td>
                    <td className="px-5 py-3.5 font-semibold text-blue-600">R$ {o.total.toFixed(2)}</td>
                    <td className="px-5 py-3.5"><Badge variant={cfg.variant} dot>{cfg.label}</Badge></td>
                    <td className="px-5 py-3.5">
                      {o.status === 'approved' ? (
                        <select
                          value={o.deliveryStatus || ''}
                          onChange={(e) => handleDeliveryStatus(o.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                        >
                          {workStatusOptions.map((ws) => <option key={ws.value} value={ws.value}>{ws.label}</option>)}
                        </select>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => copyLink(o)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Copiar link de aprovação">
                          {copiedId === o.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setSelected(o)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!orders.length && <tr><td colSpan={9} className="px-5 py-16 text-center text-slate-400">Nenhuma cotação encontrada</td></tr>}
            </tbody>
          </table>
        )}
      </Card>

      {/* Detail Modal */}
      {selected && (
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Cotação #${selected.id} — Detalhes`} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[['Cliente', selected.clientName], ['Telefone', selected.phone], ['Responsável', selected.responsible], ['Endereço', selected.address],].map(([l, v]) => (
                <div key={l}><p className="text-xs text-slate-400 mb-0.5">{l}</p><p className="text-sm font-medium text-slate-800">{v}</p></div>
              ))}
              <div><p className="text-xs text-slate-400 mb-1">Status</p><Badge variant={statusConfig[selected.status as StatusKey].variant} dot>{statusConfig[selected.status as StatusKey].label}</Badge></div>
              <div><p className="text-xs text-slate-400 mb-0.5">Validade</p><p className="text-sm font-medium text-slate-800">{new Date(selected.validUntil).toLocaleDateString('pt-BR')}</p></div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50"><tr>{['Produto', 'Qtd', 'Unid.', 'Preço', 'Subtotal'].map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {selected.items.map((i) => (
                    <tr key={i.id}>
                      <td className="px-4 py-2.5 text-slate-700">{i.productName}</td>
                      <td className="px-4 py-2.5 text-slate-600">{i.qty}</td>
                      <td className="px-4 py-2.5 text-slate-600">{i.unitName}</td>
                      <td className="px-4 py-2.5 text-slate-600">R$ {i.price.toFixed(2)}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">R$ {i.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="bg-slate-50 border-t border-slate-200"><td colSpan={4} className="px-4 py-2.5 text-right font-bold text-slate-700">Total</td><td className="px-4 py-2.5 font-bold text-blue-600">R$ {selected.total.toFixed(2)}</td></tr></tfoot>
              </table>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1">Link de Aprovação</p>
              <p className="text-xs text-blue-600 break-all">{window.location.origin}/aprovacao/{selected.token}</p>
            </div>

            {selected.status === 'approved' && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Status do Pedido</p>
                <div className="flex gap-2">
                  {workStatusOptions.map((ws) => (
                    <button key={ws.value} onClick={() => handleDeliveryStatus(selected.id, ws.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selected.deliveryStatus === ws.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {ws.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
