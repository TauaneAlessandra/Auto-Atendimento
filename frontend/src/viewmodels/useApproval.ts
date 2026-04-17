import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getOrderByToken, approveOrder, rejectOrder } from '../services/api';
import { Order } from '../types';

export function useApproval() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!token) return;
    getOrderByToken(token)
      .then((r) => setOrder(r.data))
      .catch(() => setError('Proposta não encontrada'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleApprove = async () => {
    if (!token) return;
    setActing(true); setActionError('');
    try { const r = await approveOrder(token); setOrder(r.data); }
    catch (e: unknown) {
      const msg = axios.isAxiosError(e) ? e.response?.data?.message : undefined;
      setActionError(msg || 'Erro ao aprovar');
    } finally { setActing(false); }
  };

  const handleReject = async () => {
    if (!token || !confirm('Rejeitar esta proposta?')) return;
    setActing(true); setActionError('');
    try { const r = await rejectOrder(token); setOrder(r.data); }
    catch (e: unknown) {
      const msg = axios.isAxiosError(e) ? e.response?.data?.message : undefined;
      setActionError(msg || 'Erro ao rejeitar');
    } finally { setActing(false); }
  };

  const daysLeft = order
    ? Math.max(0, Math.ceil((new Date(order.validUntil).getTime() - Date.now()) / 86400000))
    : 0;

  return { order, loading, error, acting, actionError, daysLeft, handleApprove, handleReject };
}
