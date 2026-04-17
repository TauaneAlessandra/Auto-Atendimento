import { useApproval } from '../../viewmodels/useApproval';
import { CheckCircle, XCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

type StatusKey = 'pending' | 'approved' | 'rejected' | 'expired';

const statusCfg: Record<StatusKey, { label: string; variant: 'warning' | 'success' | 'danger' | 'gray'; icon: React.ElementType; bg: string; border: string; color: string }> = {
  pending: { label: 'Aguardando aprovação', variant: 'warning', icon: Clock, bg: 'bg-amber-50', border: 'border-amber-200', color: 'text-amber-700' },
  approved: { label: 'Proposta aprovada!', variant: 'success', icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', color: 'text-emerald-700' },
  rejected: { label: 'Proposta rejeitada', variant: 'danger', icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', color: 'text-red-700' },
  expired: { label: 'Proposta expirada', variant: 'gray', icon: AlertCircle, bg: 'bg-slate-50', border: 'border-slate-200', color: 'text-slate-500' },
};

const workLabels: Record<string, string> = { em_andamento: 'Em Andamento', pausado: 'Pausado', concluido: 'Concluído' };
const workBadge: Record<string, 'info' | 'warning' | 'success'> = { em_andamento: 'info', pausado: 'warning', concluido: 'success' };

export default function ApprovalPage() {
  const vm = useApproval();

  if (vm.loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Spinner size="lg" /></div>;

  if (vm.error || !vm.order) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-lg font-bold text-slate-800 mb-2">Proposta não encontrada</h1>
        <p className="text-slate-500 text-sm">{vm.error || 'O link é inválido.'}</p>
      </div>
    </div>
  );

  const { order } = vm;
  const cfg = statusCfg[order.status as StatusKey];
  const StatusIcon = cfg.icon;
  const isPending = order.status === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-4 flex justify-center pt-10">
      <div className="w-full max-w-xl space-y-4">
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="w-4 h-4 text-blue-400" />
            Sistema de Orçamentos
          </div>
        </div>

        <div className={`${cfg.bg} ${cfg.border} border rounded-2xl p-4 flex items-center gap-3`}>
          <StatusIcon className={`w-8 h-8 flex-shrink-0 ${cfg.color}`} />
          <div>
            <p className={`font-bold ${cfg.color}`}>{cfg.label}</p>
            {isPending && <p className="text-slate-500 text-sm">Válido até {new Date(order.validUntil).toLocaleDateString('pt-BR')} ({vm.daysLeft} dia{vm.daysLeft !== 1 ? 's' : ''})</p>}
            {order.status === 'approved' && order.approvedAt && <p className="text-slate-500 text-sm">Aprovado em {new Date(order.approvedAt).toLocaleDateString('pt-BR')}</p>}
          </div>
        </div>

        {order.status === 'approved' && order.deliveryStatus && (
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center justify-between shadow-sm">
            <p className="text-sm font-medium text-slate-600">Status do Pedido</p>
            <Badge variant={workBadge[order.deliveryStatus] || 'gray'} dot>{workLabels[order.deliveryStatus]}</Badge>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-5 py-4 flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Cotação Nº {order.id}</h1>
              <p className="text-slate-400 text-sm">Proposta de Venda</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Criada em</p>
              <p className="text-white text-sm font-medium">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Cliente', order.clientName], ['Telefone', order.phone], ['Responsável', order.responsible], ['Endereço', order.address]].map(([l, v]) => (
                <div key={l}><p className="text-xs text-slate-400 mb-0.5">{l}</p><p className="font-medium text-slate-800">{v}</p></div>
              ))}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>{['Produto', 'Qtd', 'Unid.', 'Preço', 'Subtotal'].map((h) => <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((i) => (
                    <tr key={i.id}>
                      <td className="px-4 py-2.5 text-slate-700 font-medium">{i.productName}</td>
                      <td className="px-4 py-2.5 text-slate-600">{i.qty}</td>
                      <td className="px-4 py-2.5 text-slate-600">{i.unitName}</td>
                      <td className="px-4 py-2.5 text-slate-600">R$ {i.price.toFixed(2)}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">R$ {i.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 border-t-2 border-blue-100">
                    <td colSpan={4} className="px-4 py-3 text-right font-bold text-slate-700">TOTAL</td>
                    <td className="px-4 py-3 font-bold text-blue-700 text-base">R$ {order.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {isPending && (
              <>
                {vm.actionError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{vm.actionError}</div>}
                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={vm.handleReject} loading={vm.acting} icon={<XCircle className="w-5 h-5" />}>
                    Rejeitar
                  </Button>
                  <Button variant="success" size="lg" className="flex-1" onClick={vm.handleApprove} loading={vm.acting} icon={<CheckCircle className="w-5 h-5" />}>
                    Aprovar Proposta
                  </Button>
                </div>
              </>
            )}

            {order.status === 'expired' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <AlertCircle className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Esta proposta expirou em {new Date(order.validUntil).toLocaleDateString('pt-BR')}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
