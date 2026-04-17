import { useEffect, useState } from 'react';
import { getOrders, updateDeliveryStatus } from '../services/api';
import { Order, DeliveryStatus } from '../types';
import { useAdminToast } from '../components/layout/AdminLayout';

export function useOrders() {
  const toast = useAdminToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    getOrders()
      .then((r) => {
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

  return {
    orders, loading, selected, copiedId,
    setSelected, handleDeliveryStatus, copyLink,
  };
}
