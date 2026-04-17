import { useEffect, useState, FormEvent } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import { User } from '../types';
import { useAdminToast } from '../components/layout/AdminLayout';

export interface UserForm { name: string; email: string; password: string; role: string; active: boolean; }

const defaultForm: UserForm = { name: '', email: '', password: '', role: 'chat', active: true };

export function useUsers() {
  const toast = useAdminToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  const setField = (k: keyof UserForm, v: UserForm[keyof UserForm]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const fetchUsers = () => {
    setLoading(true);
    getUsers().then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setIsOpen(true); };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, active: u.active });
    setIsOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Record<string, unknown> = { name: form.name, email: form.email, role: form.role };
      if (editing) { data.active = form.active; if (form.password) data.password = form.password; }
      else data.password = form.password;
      if (editing) await updateUser(editing.id, data);
      else await createUser(data);
      setIsOpen(false);
      fetchUsers();
      toast.success(editing ? 'Usuário atualizado!' : 'Usuário criado!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Erro ao salvar usuário');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Desativar este usuário?')) return;
    try { await deleteUser(id); fetchUsers(); toast.success('Usuário desativado'); }
    catch { toast.error('Erro ao desativar'); }
  };

  return {
    users, loading, isOpen, editing, form, saving,
    setField, openCreate, openEdit, handleSubmit, handleDelete,
    closeModal: () => setIsOpen(false),
  };
}
