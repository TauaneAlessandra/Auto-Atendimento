import { useState, useEffect, useRef, FormEvent } from 'react';
import { getPublicProducts, createOrder } from '../../services/api';
import { Product, CartItem, Order, Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Sub-components
              import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatTypingIndicator from './components/ChatTypingIndicator';
import ProductCatalog from './components/ProductCatalog';
import OrderResult from './components/OrderResult';
import ChatInput from './components/ChatInput';

type Step = 'welcome' | 'ask_name' | 'ask_phone' | 'ask_manager' | 'ask_address' | 'show_products' | 'quote_ready';

interface ClientInfo { clientName: string; phone: string; responsible: string; address: string; }

export default function ChatPage() {
  const [step, setStep] = useState<Step>('ask_name');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({ clientName: '', phone: '', responsible: '', address: '' });
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const initialized = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length === 0) return '';
    if (raw.length <= 2) return `(${raw}`;
    if (raw.length <= 3) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2, 3)} ${raw.slice(3)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 3)} ${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
  };

  const addBot = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((p) => [...p, { id: Date.now() + 'b', sender: 'bot', text, timestamp: new Date() }]);
      setIsTyping(false);
    }, 1200);
  };
  
  const addUser = (text: string) => setMessages((p) => [...p, { id: Date.now() + 'u', sender: 'user', text, timestamp: new Date() }]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    setTimeout(() => {
      addBot('Olá! Me chamo **Luna**, sou sua assistente virtual. 👋\nEstou aqui para te ajudar a criar uma cotação de forma rápida e simples!');
      setTimeout(() => {
        addBot('Para começarmos nossa conversa, qual é o seu **nome completo**?');
      }, 1500);
    }, 500);
    
    getPublicProducts()
      .then((r) => setProducts(r.data))
      .catch((err) => {
        console.error('[ChatPage] falha ao carregar produtos:', err);
        addBot('Não consegui carregar o catálogo agora. Tente recarregar a página.');
      });
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    addUser(val);
    setInput('');
    
    if (step === 'ask_name') {
      setClientInfo((c) => ({ ...c, clientName: val }));
      setStep('ask_phone');
      addBot(`Prazer em te conhecer, **${val.split(' ')[0]}**! 😊\nQual é o seu **telefone de contato**?`);
    } else if (step === 'ask_phone') {
      setClientInfo((c) => ({ ...c, phone: val }));
      setStep('ask_manager');
      addBot('Ótimo. Agora, me diga o nome do **Responsável** por este pedido.');
    } else if (step === 'ask_manager') {
      setClientInfo((c) => ({ ...c, responsible: val }));
      setStep('ask_address');
      addBot('Entendido! Por fim, qual será o **endereço de entrega** para esta cotação?');
    } else if (step === 'ask_address') {
      setClientInfo((c) => ({ ...c, address: val }));
      setStep('show_products');
      addBot('Perfeito! Já tenho seus dados. 🎉\n\nAgora, selecione abaixo os produtos que você deseja orçar. Você pode ajustar as quantidades como preferir!');
    }
  };

  const updateCart = (product: Product, qty: number) => {
    setCart((p) => {
      if (qty <= 0) return p.filter((i) => i.product.id !== product.id);
      const exists = p.find((i) => i.product.id === product.id);
      if (exists) return p.map((i) => i.product.id === product.id ? { ...i, qty } : i);
      return [...p, { product, qty }];
    });
  };

  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const handleGenerateQuote = async () => {
    if (!cart.length) return;
    setLoadingOrder(true);
    try {
      const items = cart.map((i) => ({ productId: i.product.id, productName: i.product.name, unitName: i.product.unit.name, price: i.product.price, qty: i.qty }));
      const res = await createOrder({ ...clientInfo, items });
      setOrder(res.data);
      setStep('quote_ready');
      addBot('✅ **Tudo pronto! Sua cotação foi gerada.**\n\nAbaixo você pode ver o resumo da proposta. Você pode baixar em PDF ou copiar o texto formatado para enviar pelo WhatsApp.');
    } catch {
      addBot('Ops! Tive um probleminha técnico aqui ao gerar sua cotação. 😕\nPoderia tentar clicar em gerar cotação novamente?');
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleCopy = () => {
    if (!order) return;
    const text = [
      `📋 *COTAÇÃO — Nº ${order.id}*`, '',
      `👤 Cliente: ${order.clientName}`, `📞 Telefone: ${order.phone}`,
      `👤 Responsável: ${order.responsible}`, `📍 Endereço: ${order.address}`,
      `📅 Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}`,
      `⏰ Validade: ${new Date(order.validUntil).toLocaleDateString('pt-BR')}`, '',
      '📦 *ITENS:*',
      ...order.items.map((i) => `• ${i.productName} — ${i.qty} ${i.unitName} × R$ ${i.price.toFixed(2)} = R$ ${i.subtotal.toFixed(2)}`),
      '', `💰 *TOTAL: R$ ${order.total.toFixed(2)}*`, '',
      `🔗 Aprovação: ${window.location.origin}/aprovacao/${order.token}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!order) return;
    const doc = new jsPDF();
    const primaryColor = [30, 58, 138];
    const secondaryColor = [71, 85, 105];
    const accentColor = [241, 245, 249];

    // --- Header Branding ---
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPOSTA COMERCIAL', 14, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Identificação: Cotação Nº ${order.id}`, 14, 33);

    // --- Company & Order Info ---
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESTADOR DE SERVIÇOS', 14, 55);
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(['Luna Assistente Virtual', 'Atendimento Automatizado', 'Suporte Técnico 24h'], 14, 62);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATAS E VALIDADE', 140, 55);
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text([
      `Emissão: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}`,
      `Validade: ${new Date(order.validUntil).toLocaleDateString('pt-BR')}`
    ], 140, 62);

    // --- Client Block ---
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.roundedRect(14, 85, 182, 35, 3, 3, 'F');
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', 20, 93);
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const clientData = [
      `Nome: ${order.clientName}`,
      `Telefone: ${order.phone}`,
      `Responsável: ${order.responsible}`,
      `Endereço de Entrega: ${order.address}`
    ];
    clientData.forEach((line, i) => doc.text(line, 20, 100 + i * 5.5));

    // --- Items Table ---
    autoTable(doc, {
      startY: 130,
      head: [['PRODUTO', 'QTD', 'UNIDADE', 'VALOR UNIT.', 'TOTAL']],
      body: order.items.map((i) => [
        i.productName,
        i.qty.toString(),
        i.unitName,
        `R$ ${i.price.toFixed(2)}`,
        `R$ ${i.subtotal.toFixed(2)}`
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: { fillColor: [250, 251, 253] },
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;

    // --- Totals Section ---
    doc.setFillColor(30, 58, 138);
    doc.rect(130, finalY + 5, 66, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`VALOR TOTAL: R$ ${order.total.toFixed(2)}`, 135, finalY + 13);

    // --- Footer & Link ---
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(10);
    doc.text('LINK PARA APROVAÇÃO DIGITAL', 14, finalY + 30);
    
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(8);
    doc.text(`${window.location.origin}/aprovacao/${order.token}`, 14, finalY + 36);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Este documento tem validade jurídica após aprovação pelo link acima.', 14, 285);
    doc.text(`Página 1 de 1 - Gerado por Luna Assistente em ${new Date().toLocaleString('pt-BR')}`, 130, 285);

    doc.save(`cotacao-nr-${order.id}.pdf`);
  };

  const showInput = ['ask_name', 'ask_phone', 'ask_manager', 'ask_address'].includes(step);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <ChatHeader onLogout={() => { logout(); navigate('/login'); }} />

      <div className="flex-1 overflow-hidden flex justify-center relative bg-mesh">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col w-full max-w-3xl h-full relative z-10 border-x border-slate-200/40 bg-white/30 backdrop-blur-sm shadow-2xl">
          
          <div className="flex-1 overflow-y-auto px-6 pt-10 pb-32 space-y-8 scrollbar-hide">
            <div className="flex justify-center mb-10">
               <span className="bg-slate-200/50 backdrop-blur-md text-slate-500 text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em]">Início do Atendimento</span>
            </div>

            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isTyping && <ChatTypingIndicator />}

            {step === 'show_products' && products.length > 0 && (
              <ProductCatalog 
                products={products}
                cart={cart}
                onUpdateCart={updateCart}
                onGenerateQuote={handleGenerateQuote}
                loadingOrder={loadingOrder}
                total={total}
              />
            )}

            {step === 'quote_ready' && order && (
              <OrderResult 
                order={order}
                copied={copied}
                onCopy={handleCopy}
                onDownloadPDF={handleDownloadPDF}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white/90 to-transparent">
            {showInput && (
              <ChatInput 
                input={input}
                setInput={setInput}
                step={step}
                onSend={handleSend}
                formatPhone={formatPhone}
              />
            )}
          </div>
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
