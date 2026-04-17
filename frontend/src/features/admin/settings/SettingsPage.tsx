import { useState, FormEvent } from 'react';
import { useSettings } from '../../../viewmodels/useSettings';
import { Category, Unit } from '../../../types';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import { Plus, Pencil, Check, X, Trash2 } from 'lucide-react';

function EditableItem({ name, active, onSave, onDelete }: {
  name: string; active: boolean;
  onSave: (n: string, a: boolean) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(name);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
      {editing ? (
        <>
          <input value={val} onChange={(e) => setVal(e.target.value)} autoFocus className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm mr-3 focus:ring-2 focus:ring-blue-100 outline-none" />
          <div className="flex gap-1">
            <button onClick={() => { onSave(val, active); setEditing(false); }} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check className="w-4 h-4" /></button>
            <button onClick={() => { setVal(name); setEditing(false); }} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">{name}</span>
            <Badge variant={active ? 'success' : 'gray'} dot>{active ? 'Ativo' : 'Inativo'}</Badge>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setEditing(true)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, items, onAdd, onSave, onDelete }: {
  title: string; items: (Category | Unit)[];
  onAdd: (name: string) => void;
  onSave: (id: number, name: string, active: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const [newName, setNewName] = useState('');
  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
  };

  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-slate-200">
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{items.length} {items.length === 1 ? 'item' : 'itens'} cadastrado{items.length !== 1 ? 's' : ''}</p>
      </div>
      <div>{items.length ? items.map((i) => (
        <EditableItem key={i.id} name={i.name} active={i.active} onSave={(n, a) => onSave(i.id, n, a)} onDelete={() => onDelete(i.id)} />
      )) : <p className="px-5 py-8 text-sm text-slate-400 text-center">Nenhum item cadastrado</p>}</div>
      <form onSubmit={handleAdd} className="px-4 py-3 border-t border-slate-100 flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={`Adicionar ${title.toLowerCase()}...`} className="flex-1" />
        <Button type="submit" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>Adicionar</Button>
      </form>
    </Card>
  );
}

export default function SettingsPage() {
  const vm = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Configurações</h2>
        <p className="text-slate-500 text-sm">Gerencie as categorias de produtos e unidades de medida</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section
          title="Categorias de Produtos"
          items={vm.categories}
          onAdd={vm.addCategory}
          onSave={vm.saveCategory}
          onDelete={vm.removeCategory}
        />
        <Section
          title="Unidades de Medida"
          items={vm.units}
          onAdd={vm.addUnit}
          onSave={vm.saveUnit}
          onDelete={vm.removeUnit}
        />
      </div>
    </div>
  );
}
