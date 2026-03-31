import { useEffect, useState, FormEvent } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getServiceTypes, getUnits } from '../../../services/api';
import { Product, ServiceType, Unit } from '../../../types';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import Badge from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import ImageCropper from '../../../components/ui/ImageCropper';
import Spinner from '../../../components/ui/Spinner';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { useAdminToast } from '../../../components/layout/AdminLayout';

interface ProductForm {
  name: string; price: string; serviceTypeId: string; description: string;
  unitId: string; minQty: string; maxQty: string; photo: File | null; active: boolean;
}

const defaultForm: ProductForm = { name: '', price: '', serviceTypeId: '', description: '', unitId: '', minQty: '1', maxQty: '10', photo: null, active: true };

export default function ProductsPage() {
  const toast = useAdminToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  const f = (k: keyof ProductForm, v: ProductForm[keyof ProductForm]) => setForm((p) => ({ ...p, [k]: v }));

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getProducts(), getServiceTypes(), getUnits()])
      .then(([p, s, u]) => { setProducts(p.data); setServiceTypes(s.data); setUnits(u.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setIsOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), serviceTypeId: String(p.serviceTypeId), description: p.description, unitId: String(p.unitId), minQty: String(p.minQty), maxQty: String(p.maxQty), photo: null, active: p.active });
    setIsOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries({ name: form.name, price: form.price, serviceTypeId: form.serviceTypeId, description: form.description, unitId: form.unitId, minQty: form.minQty, maxQty: form.maxQty, active: String(form.active) }).forEach(([k, v]) => fd.append(k, v));
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Produtos</h2>
          <p className="text-slate-500 text-sm">Catálogo de serviços disponíveis</p>
        </div>
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Novo Produto</Button>
      </div>

      <Card padding={false}>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unidade</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qtd</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {p.photo ? <img src={`/uploads/${p.photo}`} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-300 m-2.5" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[180px]">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{p.serviceType.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{p.unit.name}</td>
                  <td className="px-5 py-3.5 font-semibold text-blue-600">R$ {p.price.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{p.minQty}–{p.maxQty}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={p.active ? 'success' : 'gray'} dot>{p.active ? 'Ativo' : 'Inativo'}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!products.length && <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-400">Nenhum produto cadastrado</td></tr>}
            </tbody>
          </table>
        )}
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Editar Produto' : 'Novo Produto'} size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button form="product-form" type="submit" loading={saving}>Salvar Produto</Button>
          </div>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
          <ImageCropper
            value={form.photo}
            previewUrl={editing?.photo ? `/uploads/${editing.photo}` : undefined}
            onChange={(file) => f('photo', file)}
            label="Foto do Produto"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Nome do Produto *" value={form.name} onChange={(e) => f('name', e.target.value)} placeholder="Ex: Suporte Técnico" required />
            </div>
            <Input label="Preço (R$) *" type="number" step="0.01" min="0" value={form.price} onChange={(e) => f('price', e.target.value)} placeholder="0,00" required />
            <Select label="Tipo de Serviço *" value={form.serviceTypeId} onChange={(e) => f('serviceTypeId', e.target.value)} required>
              <option value="">Selecione...</option>
              {serviceTypes.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select label="Unidade *" value={form.unitId} onChange={(e) => f('unitId', e.target.value)} required>
              <option value="">Selecione...</option>
              {units.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <Input label="Qtd Mínima *" type="number" min="1" value={form.minQty} onChange={(e) => f('minQty', e.target.value)} required />
            <Input label="Qtd Máxima *" type="number" min="1" value={form.maxQty} onChange={(e) => f('maxQty', e.target.value)} required />
            <div className="col-span-2">
              <Textarea label="Descrição *" value={form.description} onChange={(e) => f('description', e.target.value)} placeholder="Descreva o produto..." required />
            </div>
            {editing && (
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <input type="checkbox" id="prod-active" checked={form.active} onChange={(e) => f('active', e.target.checked)} className="rounded accent-blue-600" />
                <label htmlFor="prod-active" className="text-sm text-slate-700">Produto ativo</label>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
