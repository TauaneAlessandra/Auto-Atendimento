import { useState, useEffect, useRef, FormEvent } from 'react';
import { getPublicProducts, createOrder } from '../services/api';
import { Product, CartItem, Order, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ChatStep = 'welcome' | 'ask_name' | 'ask_phone' | 'ask_manager' | 'ask_address' | 'show_products' | 'quote_ready';

interface ClientInfo { clientName: string; phone: string; responsible: string; address: string; }

export function useChat() {
  const [step, setStep] = useState<ChatStep>('ask_name');
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
        console.error('[useChat] falha ao carregar produtos:', err);
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

    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPOSTA COMERCIAL', 14, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Identificação: Cotação Nº ${order.id}`, 14, 33);

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
      `Validade: ${new Date(order.validUntil).toLocaleDateString('pt-BR')}`,
    ], 140, 62);

    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.roundedRect(14, 85, 182, 35, 3, 3, 'F');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', 20, 93);
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    [
      `Nome: ${order.clientName}`,
      `Telefone: ${order.phone}`,
      `Responsável: ${order.responsible}`,
      `Endereço de Entrega: ${order.address}`,
    ].forEach((line, i) => doc.text(line, 20, 100 + i * 5.5));

    autoTable(doc, {
      startY: 130,
      head: [['PRODUTO', 'QTD', 'UNIDADE', 'VALOR UNIT.', 'TOTAL']],
      body: order.items.map((i) => [
        i.productName, i.qty.toString(), i.unitName,
        `R$ ${i.price.toFixed(2)}`, `R$ ${i.subtotal.toFixed(2)}`,
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 70 }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } },
      alternateRowStyles: { fillColor: [250, 251, 253] },
      margin: { left: 14, right: 14 },
    });

    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 150;

    doc.setFillColor(30, 58, 138);
    doc.rect(130, finalY + 5, 66, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`VALOR TOTAL: R$ ${order.total.toFixed(2)}`, 135, finalY + 13);

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

  const handleLogout = () => { logout(); navigate('/login'); };

  const showInput = ['ask_name', 'ask_phone', 'ask_manager', 'ask_address'].includes(step);

  return {
    step, messages, input, setInput, isTyping, products, cart, order,
    copied, loadingOrder, messagesEndRef, showInput, total,
    handleSend, updateCart, handleGenerateQuote, handleCopy, handleDownloadPDF, handleLogout, formatPhone,
  };
}
