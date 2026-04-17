import { Bot } from 'lucide-react';

export default function ChatTypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-50 mt-auto">
         <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
      </div>
      <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm shadow-slate-200/30 flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
}
