import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { DashboardStats } from '../types';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
