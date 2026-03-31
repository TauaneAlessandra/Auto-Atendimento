import { useState, useEffect, useRef, FormEvent } from 'react';
import { getPublicProducts, createOrder } from '../../services/api';
import { Product, CartItem, Order } from '../../types';
import { Send, ShoppingCart, FileText, Copy, Check, Minus, Plus, LogOut, Zap, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Step = 'ask_name' | 'ask_phone' | 'ask_manager' | 'ask_cost_center' | 'show_products' | 'quote_ready';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

interface ClientInfo { name: string; phone: string; manager: string; costCenter: string; }

export default function ChatPage() {
  const [step, setStep] = useState<Step>('ask_name');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [clientInfo, setClientInfo] = useState<ClientInfo>({ name: '', phone: '', manager: '', costCenter: '' });
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const addBot = (text: string) => setMessages((p) => [...p, { id: Date.now() + 'b', sender: 'bot', text }]);
  const addUser = (text: string) => setMessages((p) => [...p, { id: Date.now() + 'u', sender: 'user', text }]);

  useEffect(() => {
    setTimeout(() => addBot('Olá! 👋 Bem-vindo ao sistema de **orçamentos**.\nPara começar, qual é o seu nome completo?'), 300);
    getPublicProducts().then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    addUser(val);
    setInput('');
    setTimeout(() => {
      if (step === 'ask_name') {
        setClientInfo((c) => ({ ...c, name: val }));
        setStep('ask_phone');
        addBot(`Olá, **${val}**! 😊\nQual é o seu **telefone de contato**?`);
      } else if (step === 'ask_phone') {
        setClientInfo((c) => ({ ...c, phone: val }));
        setStep('ask_manager');
        addBot('Certo! Qual é o nome do seu **gestor responsável**?');
      } else if (step === 'ask_manager') {
        setClientInfo((c) => ({ ...c, manager: val }));
        setStep('ask_cost_center');
        addBot('Perfeito! E qual é o **centro de custo**?');
      } else if (step === 'ask_cost_center') {
        setClientInfo((c) => ({ ...c, costCenter: val }));
        setStep('show_products');
        addBot('Ótimo! Agora selecione os **produtos** abaixo e ajuste as quantidades. Quando terminar, clique em **"Gerar Orçamento"**. 👇');
      }
    }, 350);
  };

  const updateCart = (product: Product, qty: number) => {
    setCart((p) => {
      if (qty <= 0) return p.filter((i) => i.product.id !== product.id);
      const exists = p.find((i) => i.product.id === product.id);
      if (exists) return p.map((i) => i.product.id === product.id ? { ...i, qty } : i);
      return [...p, { product, qty }];
    });
  };

  const getQty = (id: number) => cart.find((i) => i.product.id === id)?.qty ?? 0;
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const handleGenerateQuote = async () => {
    if (!cart.length) return;
    setLoadingOrder(true);
    try {
      const items = cart.map((i) => ({ productId: i.product.id, productName: i.product.name, unitName: i.product.unit.name, price: i.product.price, qty: i.qty }));
      const res = await createOrder({ ...clientInfo, items });
      setOrder(res.data);
      setStep('quote_ready');
      addBot('✅ Orçamento gerado com sucesso!\n\nVocê pode **copiar o texto** para enviar pelo Teams ou **baixar em PDF**. O link de aprovação também está disponível abaixo.');
    } catch {
      addBot('❌ Ocorreu um erro ao gerar o orçamento. Tente novamente.');
    } finally {
      setLoadingOrder(false);
    }
  };

  const getTeamsText = () => {
    if (!order) return '';
    return [
      `📋 *ORÇAMENTO — OS #${order.id}*`, '',
      `👤 Cliente: ${order.clientName}`, `📞 Telefone: ${order.phone}`,
      `👔 Gestor: ${order.manager}`, `🏢 Centro de Custo: ${order.costCenter}`,
      `📅 Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}`,
      `⏰ Validade: ${new Date(order.validUntil).toLocaleDateString('pt-BR')}`, '',
      '📦 *ITENS:*',
      ...order.items.map((i) => `• ${i.productName} — ${i.qty} ${i.unitName} × R$ ${i.price.toFixed(2)} = R$ ${i.subtotal.toFixed(2)}`),
      '', `💰 *TOTAL: R$ ${order.total.toFixed(2)}*`, '',
      `🔗 Aprovação: ${window.location.origin}/aprovacao/${order.token}`,
    ].join('\n');
  };

  const handleCopy = () => { navigator.clipboard.writeText(getTeamsText()); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleDownloadPDF = () => {
    if (!order) return;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(30, 58, 138);
    doc.text(`Orçamento — OS #${order.id}`, 14, 22);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}   Validade: ${new Date(order.validUntil).toLocaleDateString('pt-BR')}`, 14, 30);
    doc.setFontSize(11); doc.setTextColor(30);
    doc.text('Dados do Cliente', 14, 42);
    doc.setFontSize(9); doc.setTextColor(60);
    [['Nome', order.clientName], ['Telefone', order.phone], ['Gestor', order.manager], ['Centro de Custo', order.costCenter]].forEach(([l, v], i) => doc.text(`${l}: ${v}`, 14, 49 + i * 6));
    autoTable(doc, {
      startY: 80,
      head: [['Produto', 'Qtd', 'Unidade', 'Preço Unit.', 'Subtotal']],
      body: order.items.map((i) => [i.productName, i.qty, i.unitName, `R$ ${i.price.toFixed(2)}`, `R$ ${i.subtotal.toFixed(2)}`]),
      foot: [['', '', '', 'TOTAL', `R$ ${order.total.toFixed(2)}`]],
      styles: { fontSize: 9 }, headStyles: { fillColor: [37, 99, 235] }, footStyles: { fillColor: [241, 245, 249], fontStyle: 'bold' },
    });
    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8); doc.setTextColor(120);
    doc.text(`Link de aprovação: ${window.location.origin}/aprovacao/${order.token}`, 14, y);
    doc.save(`orcamento-os-${order.id}.pdf`);
  };

  const showInput = ['ask_name', 'ask_phone', 'ask_manager', 'ask_cost_center'].includes(step);

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 px-4 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">Assistente de Orçamentos</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-slate-400 text-xs">Online</p>
            </div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex justify-center">
        <div className="flex flex-col w-full max-w-2xl bg-white shadow-sm">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  <p className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            ))}

            {/* Product Selection */}
            {step === 'show_products' && products.length > 0 && (
              <div className="ml-10 space-y-2">
                {products.map((p) => {
                  const qty = getQty(p.id);
                  return (
                    <div key={p.id} className="border border-slate-200 rounded-2xl p-3 bg-white flex gap-3 items-center shadow-sm hover:border-blue-200 transition-colors">
                      {p.photo ? (
                        <img src={`/uploads/${p.photo}`} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.serviceType.name}</p>
                        <p className="text-blue-600 font-bold text-sm mt-0.5">R$ {p.price.toFixed(2)} / {p.unit.name}</p>
                        <p className="text-xs text-slate-400">Qtd: {p.minQty}–{p.maxQty}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => updateCart(p, Math.max(0, qty - 1))} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors text-slate-600">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={`w-7 text-center text-sm font-bold ${qty > 0 ? 'text-blue-600' : 'text-slate-300'}`}>{qty}</span>
                        <button onClick={() => updateCart(p, Math.min(p.maxQty, qty + 1))} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {cart.length > 0 && (
                  <button
                    onClick={handleGenerateQuote}
                    disabled={loadingOrder}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 mt-2 transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {loadingOrder ? 'Gerando orçamento...' : `Gerar Orçamento — ${cart.length} item${cart.length > 1 ? 's' : ''} · R$ ${total.toFixed(2)}`}
                  </button>
                )}
              </div>
            )}

            {/* Quote Ready */}
            {step === 'quote_ready' && order && (
              <div className="ml-10 space-y-3">
                {/* Summary card */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-slate-900 px-4 py-3">
                    <p className="font-bold text-white text-sm">OS #{order.id} — {order.clientName}</p>
                    <p className="text-slate-400 text-xs">Válido até {new Date(order.validUntil).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.productName} <span className="text-slate-400">× {item.qty} {item.unitName}</span></span>
                        <span className="font-semibold text-slate-800">R$ {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold">
                      <span className="text-slate-700">Total</span>
                      <span className="text-blue-600">R$ {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="flex-1 border border-slate-300 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                    {copied ? <><Check className="w-4 h-4 text-emerald-500" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar para Teams</>}
                  </button>
                  <button onClick={handleDownloadPDF} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                    <FileText className="w-4 h-4" /> Baixar PDF
                  </button>
                </div>

                {/* Approval link */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">🔗 Link de Aprovação</p>
                  <p className="text-xs text-emerald-600 break-all">{window.location.origin}/aprovacao/{order.token}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {showInput && (
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none placeholder:text-slate-400"
                placeholder="Digite sua resposta..."
                autoFocus
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
