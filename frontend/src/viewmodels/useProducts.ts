import { useEffect, useState, FormEvent } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, getUnits } from '../services/api';
import { Product, Category, Unit } from '../types';
import { useAdminToast } from '../components/layout/AdminLayout';

export interface ProductForm {
  name: string; price: string; categoryId: string; description: string;
  unitId: string; minQty: string; maxQty: string; photo: File | null; active: boolean;
}

const defaultForm: ProductForm = {
  name: '', price: '', categoryId: '', description: '',
  unitId: '', minQty: '1', maxQty: '10', photo: null, active: true,
};

export function useProducts() {
  const toast = useAdminToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  const setField = (k: keyof ProductForm, v: ProductForm[keyof ProductForm]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getProducts(), getCategories(), getUnits()])
      .then(([p, c, u]) => { setProducts(p.data); setCategories(c.data); setUnits(u.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setIsOpen(true); };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, price: String(p.price), categoryId: String(p.categoryId),
      description: p.description, unitId: String(p.unitId), minQty: String(p.minQty),
      maxQty: String(p.maxQty), photo: null, active: p.active,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries({
        name: form.name, price: form.price, categoryId: form.categoryId,
        description: form.description, unitId: form.unitId, minQty: form.minQty,
        maxQty: form.maxQty, active: String(form.active),
      }).forEach(([k, v]) => fd.append(k, v));
      if (form.photo) fd.append('photo', form.photo);
      if (editing) await updateProduct(editing.id, fd);
      else await createProduct(fd);
      setIsOpen(false);
      fetchAll();
      toast.success(editing ? 'Produto atualizado!' : 'Produto criado!');
    } catch {
      toast.error('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Desativar este produto?')) return;
    try { await deleteProduct(id); fetchAll(); toast.success('Produto desativado'); }
    catch { toast.error('Erro ao desativar produto'); }
  };

  return {
    products, categories, units, loading, isOpen, editing, form, saving,
    setField, openCreate, openEdit, handleSubmit, handleDelete,
    closeModal: () => setIsOpen(false),
  };
}
