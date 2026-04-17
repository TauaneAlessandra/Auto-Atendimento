import { Fragment } from 'react';
import { Bot } from 'lucide-react';
import { Message } from '../../../types';

interface ChatMessageProps {
  message: Message;
}

function renderBold(text: string, isUser: boolean) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} className={`font-black ${isUser ? 'text-white underline decoration-white/30' : 'text-blue-600'}`}>{part}</span>
      : <Fragment key={i}>{part}</Fragment>,
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const timestamp = typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp;
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-reveal`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-auto shadow-lg shadow-blue-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div className={`relative max-w-[85%] px-6 py-4 rounded-[1.8rem] text-[14px] leading-relaxed shadow-premium transition-all
        ${isUser 
          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none' 
          : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/50 hover:shadow-xl'}`}>
        
        <p className="whitespace-pre-line font-medium leading-[1.6]">{renderBold(message.text, isUser)}</p>
        
        <div className={`flex items-center gap-1.5 mt-2 opacity-40 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[9px] font-black uppercase tracking-widest">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isUser && <div className="w-1 h-1 bg-white rounded-full opacity-50" />}
        </div>
      </div>
    </div>
  );
}
