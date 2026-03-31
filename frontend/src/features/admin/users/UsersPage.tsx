import { useEffect, useState, FormEvent } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/api';
import { User } from '../../../types';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import { Plus, Pencil, Trash2, Shield, MessageSquare } from 'lucide-react';
import { useAdminToast } from '../../../components/layout/AdminLayout';

interface UserForm { name: string; email: string; password: string; role: string; active: boolean; }
const defaultForm: UserForm = { name: '', email: '', password: '', role: 'chat', active: true };

export default function UsersPage() {
  const toast = useAdminToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  const f = (k: keyof UserForm, v: UserForm[keyof UserForm]) => setForm((p) => ({ ...p, [k]: v }));

  const fetchUsers = () => { setLoading(true); getUsers().then((r) => setUsers(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setIsOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, active: u.active }); setIsOpen(true); };

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Usuários</h2>
          <p className="text-slate-500 text-sm">Controle de acesso ao sistema</p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Novo Usuário</Button>
      </div>

      <Card padding={false}>
        {loading ? <div className="flex items-center justify-center py-16"><Spinner /></div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {['Nome', 'Email', 'Perfil', 'Status', 'Criado em', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={u.role === 'admin' ? 'purple' : 'info'}>
                      {u.role === 'admin' ? <><Shield className="w-3 h-3 inline mr-1" />Admin</> : <><MessageSquare className="w-3 h-3 inline mr-1" />Chat</>}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5"><Badge variant={u.active ? 'success' : 'gray'} dot>{u.active ? 'Ativo' : 'Inativo'}</Badge></td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400">Nenhum usuário cadastrado</td></tr>}
            </tbody>
          </table>
        )}
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Editar Usuário' : 'Novo Usuário'}
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button><Button form="user-form" type="submit" loading={saving}>Salvar</Button></div>}
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome *" value={form.name} onChange={(e) => f('name', e.target.value)} placeholder="Nome completo" required />
          <Input label="Email *" type="email" value={form.email} onChange={(e) => f('email', e.target.value)} placeholder="email@exemplo.com" required />
          <Input label={editing ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'} type="password" value={form.password} onChange={(e) => f('password', e.target.value)} placeholder="••••••••" required={!editing} />
          <Select label="Perfil de Acesso *" value={form.role} onChange={(e) => f('role', e.target.value)}>
            <option value="chat">Chat — apenas chatbot</option>
            <option value="admin">Admin — painel completo</option>
          </Select>
          {editing && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="u-active" checked={form.active} onChange={(e) => f('active', e.target.checked)} className="rounded accent-blue-600" />
              <label htmlFor="u-active" className="text-sm text-slate-700">Usuário ativo</label>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
