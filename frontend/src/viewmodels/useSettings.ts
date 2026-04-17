import { useEffect, useState } from 'react';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getUnits, createUnit, updateUnit, deleteUnit,
} from '../services/api';
import { Category, Unit } from '../types';
import { useAdminToast } from '../components/layout/AdminLayout';

export function useSettings() {
  const toast = useAdminToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const fetchAll = () =>
    Promise.all([getCategories(), getUnits()]).then(([c, u]) => {
      setCategories(c.data);
      setUnits(u.data);
    });

  useEffect(() => { fetchAll(); }, []);

  const wrap = async (fn: () => Promise<unknown>, msg: string) => {
    try { await fn(); fetchAll(); toast.success(msg); }
    catch { toast.error('Erro ao realizar operação'); }
  };

  const addCategory = (name: string) => wrap(() => createCategory({ name }), 'Categoria criada!');
  const saveCategory = (id: number, name: string, active: boolean) =>
    wrap(() => updateCategory(id, { name, active }), 'Categoria atualizada!');
  const removeCategory = (id: number) => {
    if (confirm('Desativar esta categoria?')) wrap(() => deleteCategory(id), 'Categoria desativada');
  };

  const addUnit = (name: string) => wrap(() => createUnit({ name }), 'Unidade criada!');
  const saveUnit = (id: number, name: string, active: boolean) =>
    wrap(() => updateUnit(id, { name, active }), 'Unidade atualizada!');
  const removeUnit = (id: number) => {
    if (confirm('Desativar esta unidade?')) wrap(() => deleteUnit(id), 'Unidade desativada');
  };

  return {
    categories, units,
    addCategory, saveCategory, removeCategory,
    addUnit, saveUnit, removeUnit,
  };
}
