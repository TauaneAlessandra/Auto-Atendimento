import { FormEvent } from 'react';
import { useProducts } from '../../../viewmodels/useProducts';
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

export default function ProductsPage() {
  const vm = useProducts();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Produtos</h2>
          <p className="text-slate-500 text-sm">Catálogo de produtos disponíveis</p>
        </div>
        <Button onClick={vm.openCreate} icon={<Plus className="w-4 h-4" />}>Novo Produto</Button>
      </div>

      <Card padding={false}>
        {vm.loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unidade</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qtd</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vm.products.map((p) => (
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
                  <td className="px-5 py-3.5 text-slate-600">{p.category.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{p.unit.name}</td>
                  <td className="px-5 py-3.5 font-semibold text-blue-600">R$ {p.price.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{p.minQty}–{p.maxQty}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={p.active ? 'success' : 'gray'} dot>{p.active ? 'Ativo' : 'Inativo'}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => vm.openEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => vm.handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!vm.products.length && <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-400">Nenhum produto cadastrado</td></tr>}
            </tbody>
          </table>
        )}
      </Card>

      <Modal isOpen={vm.isOpen} onClose={vm.closeModal} title={vm.editing ? 'Editar Produto' : 'Novo Produto'} size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={vm.closeModal}>Cancelar</Button>
            <Button form="product-form" type="submit" loading={vm.saving}>Salvar Produto</Button>
          </div>
        }
      >
        <form id="product-form" onSubmit={(e: FormEvent) => vm.handleSubmit(e)} className="space-y-6">
          <ImageCropper
            value={vm.form.photo}
            previewUrl={vm.editing?.photo ? `/uploads/${vm.editing.photo}` : undefined}
            onChange={(file) => vm.setField('photo', file)}
            label="Visual Identitário"
          />

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="col-span-2">
              <Input label="Nome do Produto *" value={vm.form.name} onChange={(e) => vm.setField('name', e.target.value)} placeholder="Ex: Martelo de Aço" required />
            </div>

            <Input label="Valor Base (R$) *" type="number" step="0.01" min="0" value={vm.form.price} onChange={(e) => vm.setField('price', e.target.value)} placeholder="0,00" required />

            <Select label="Categoria do Produto *" value={vm.form.categoryId} onChange={(e) => vm.setField('categoryId', e.target.value)} required>
              <option value="">Selecione a categoria...</option>
              {vm.categories.filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>

            <Select label="Unidade de Medida *" value={vm.form.unitId} onChange={(e) => vm.setField('unitId', e.target.value)} required>
              <option value="">Selecione a unidade...</option>
              {vm.units.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Qtd Mín *" type="number" min="1" value={vm.form.minQty} onChange={(e) => vm.setField('minQty', e.target.value)} required />
              <Input label="Qtd Máx *" type="number" min="1" value={vm.form.maxQty} onChange={(e) => vm.setField('maxQty', e.target.value)} required />
            </div>

            <div className="col-span-2">
              <Textarea label="Descrição do Produto *" value={vm.form.description} onChange={(e) => vm.setField('description', e.target.value)} placeholder="Descreva os detalhes deste produto..." required />
            </div>

            {vm.editing && (
              <div className="col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">Disponibilidade do Item</p>
                  <p className="text-[10px] text-slate-500 font-medium">Define se o produto aparece no catálogo</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${vm.form.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {vm.form.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <input type="checkbox" id="prod-active" checked={vm.form.active} onChange={(e) => vm.setField('active', e.target.checked)} className="w-5 h-5 rounded-lg accent-blue-600 cursor-pointer" />
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
