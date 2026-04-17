import { FormEvent } from 'react';
import { useUsers } from '../../../viewmodels/useUsers';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import { Plus, Pencil, Trash2, Shield, MessageSquare } from 'lucide-react';

export default function UsersPage() {
  const vm = useUsers();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Usuários</h2>
          <p className="text-slate-500 text-sm">Controle de acesso ao sistema</p>
        </div>
        <Button onClick={vm.openCreate} icon={<Plus className="w-4 h-4" />}>Novo Usuário</Button>
      </div>

      <Card padding={false}>
        {vm.loading ? <div className="flex items-center justify-center py-16"><Spinner /></div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {['Nome', 'Email', 'Perfil', 'Status', 'Criado em', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vm.users.map((u) => (
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
                      <button onClick={() => vm.openEdit(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => vm.handleDelete(u.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!vm.users.length && <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400">Nenhum usuário cadastrado</td></tr>}
            </tbody>
          </table>
        )}
      </Card>

      <Modal isOpen={vm.isOpen} onClose={vm.closeModal} title={vm.editing ? 'Editar Usuário' : 'Novo Usuário'}
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={vm.closeModal}>Cancelar</Button><Button form="user-form" type="submit" loading={vm.saving}>Salvar</Button></div>}
      >
        <form id="user-form" onSubmit={(e: FormEvent) => vm.handleSubmit(e)} className="space-y-4">
          <Input label="Nome *" value={vm.form.name} onChange={(e) => vm.setField('name', e.target.value)} placeholder="Nome completo" required />
          <Input label="Email *" type="email" value={vm.form.email} onChange={(e) => vm.setField('email', e.target.value)} placeholder="email@exemplo.com" required />
          <Input label={vm.editing ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'} type="password" value={vm.form.password} onChange={(e) => vm.setField('password', e.target.value)} placeholder="••••••••" required={!vm.editing} />
          <Select label="Perfil de Acesso *" value={vm.form.role} onChange={(e) => vm.setField('role', e.target.value)}>
            <option value="chat">Chat — apenas chatbot</option>
            <option value="admin">Admin — painel completo</option>
          </Select>
          {vm.editing && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="u-active" checked={vm.form.active} onChange={(e) => vm.setField('active', e.target.checked)} className="rounded accent-blue-600" />
              <label htmlFor="u-active" className="text-sm text-slate-700">Usuário ativo</label>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
