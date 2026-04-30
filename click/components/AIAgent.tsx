"use client";
import React, { useState, useRef, useEffect } from 'react';
import { runAgent } from '@/lib/click-agent';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Pass the last few messages for context
    const context = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
    context.push({ role: 'user', content: userMsg });

    const response = await runAgent(context);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response || "Something went wrong." }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[500px] glass rounded-xl overflow-hidden shadow-3d border border-neon-cyan/20">
      <div className="bg-neon-cyan/10 p-3 border-b border-white/5 flex items-center gap-2">
        <Bot className="text-neon-cyan animate-bounce-slow" />
        <div>
          <h3 className="font-bold text-neon-cyan text-sm">click intelligence agent</h3>
          <p className="text-[10px] text-gray-400">Ask me anything about finances!</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-10">
            <p>👋 Hi! I'm your AI Accountant.</p>
            <p className="text-xs mt-2">Try asking: "What is the net profit this month?"</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-neon-pink/20 text-neon-pink' : 'bg-neon-cyan/20 text-neon-cyan'}`}>
              {m.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-3 rounded-xl max-w-[80%] text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-neon-pink/10 border border-neon-pink/20 rounded-tr-none text-gray-200' 
                : 'bg-neon-cyan/10 border border-neon-cyan/20 rounded-tl-none text-gray-200'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center">
              <Loader2 className="animate-spin text-neon-cyan" size={16} />
            </div>
            <div className="bg-neon-cyan/10 p-3 rounded-xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/5 flex gap-2">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask AI..."
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-neon-cyan outline-none transition-colors"
        />
        <button 
          disabled={loading}
          type="submit" 
          className="bg-neon-cyan text-black p-2 rounded-lg hover:bg-neon-cyan/80 transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
