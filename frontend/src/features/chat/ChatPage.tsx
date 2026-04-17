import { useChat } from '../../viewmodels/useChat';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatTypingIndicator from './components/ChatTypingIndicator';
import ProductCatalog from './components/ProductCatalog';
import OrderResult from './components/OrderResult';
import ChatInput from './components/ChatInput';

export default function ChatPage() {
  const vm = useChat();

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <ChatHeader onLogout={vm.handleLogout} />

      <div className="flex-1 overflow-hidden flex justify-center relative bg-mesh">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col w-full max-w-3xl h-full relative z-10 border-x border-slate-200/40 bg-white/30 backdrop-blur-sm shadow-2xl">
          <div className="flex-1 overflow-y-auto px-6 pt-10 pb-32 space-y-8 scrollbar-hide">
            <div className="flex justify-center mb-10">
              <span className="bg-slate-200/50 backdrop-blur-md text-slate-500 text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em]">Início do Atendimento</span>
            </div>

            {vm.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {vm.isTyping && <ChatTypingIndicator />}

            {vm.step === 'show_products' && vm.products.length > 0 && (
              <ProductCatalog
                products={vm.products}
                cart={vm.cart}
                onUpdateCart={vm.updateCart}
                onGenerateQuote={vm.handleGenerateQuote}
                loadingOrder={vm.loadingOrder}
                total={vm.total}
              />
            )}

            {vm.step === 'quote_ready' && vm.order && (
              <OrderResult
                order={vm.order}
                copied={vm.copied}
                onCopy={vm.handleCopy}
                onDownloadPDF={vm.handleDownloadPDF}
              />
            )}

            <div ref={vm.messagesEndRef} />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white/90 to-transparent">
            {vm.showInput && (
              <ChatInput
                input={vm.input}
                setInput={vm.setInput}
                step={vm.step}
                onSend={vm.handleSend}
                formatPhone={vm.formatPhone}
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
