import { Send } from 'lucide-react';
import { FormEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  step: string;
  onSend: (e: FormEvent) => void;
  formatPhone: (val: string) => string;
}

export default function ChatInput({ input, setInput, step, onSend, formatPhone }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const getPlaceholder = () => {
    switch (step) {
      case 'ask_name': return 'Digite seu nome completo...';
      case 'ask_phone': return '(00) 0 0000-0000';
      case 'ask_manager': return 'Nome do responsável...';
      case 'ask_address': return 'Rua, número, bairro...';
      default: return 'Escreva sua mensagem...';
    }
  };

  return (
    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#f1f5f9] via-[#f1f5f9] to-transparent">
      <div className="max-w-2xl mx-auto">
        <form 
          onSubmit={onSend} 
          className="bg-white p-1.5 pl-5 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-300/50 flex gap-2 relative z-10 focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-300 transition-all duration-500"
        >
          <input
            ref={inputRef}
            id="chat-input"
            name="chat-input"
            type="text"
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              if (step === 'ask_phone') {
                setInput(formatPhone(val));
              } else {
                setInput(val);
              }
            }}
            className="flex-1 bg-transparent border-none py-4 text-[1rem] outline-none placeholder:text-slate-300 placeholder:font-medium text-slate-700 font-medium"
            placeholder={getPlaceholder()}
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-200 text-white w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex-shrink-0"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
        <div className="mt-3 flex justify-center gap-4 opacity-30 select-none grayscale pointer-events-none">
           <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Fluxo Humano</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Venda Garantida</span>
           </div>
        </div>
      </div>
    </div>
  );
}
