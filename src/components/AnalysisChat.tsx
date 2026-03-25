import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Cpu, User } from 'lucide-react';
import type { Article } from '../types/article';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

interface AnalysisChatProps {
  article: Article;
}

export const AnalysisChat: React.FC<AnalysisChatProps> = ({ article }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Strategic Analyst initialized. Re-assessing signal: ${article.id}. How can I assist with this intelligence packet?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Simulated AI Response
    setTimeout(() => {
      let response = '';
      if (userMsg.toLowerCase().includes('threat') || userMsg.toLowerCase().includes('risk')) {
        response = `Based on current trajectory, this represents a ${article.signalLevel} threat. Primary risk factors include ${article.matchedKeywords.slice(0, 2).join(' and ')}.`;
      } else if (userMsg.toLowerCase().includes('location') || userMsg.toLowerCase().includes('where')) {
        response = `Signal localized to ${article.location?.label || 'coordinates unknown'}. Strategic importance of this sector is currently rated high.`;
      } else if (userMsg.toLowerCase().includes('next') || userMsg.toLowerCase().includes('follow')) {
        response = `Recommended protocols: Immediate surveillance of nearby electronic signatures and cross-referencing with ${article.category} trends.`;
      } else {
        response = `Intelligence assessment confirms: ${article.aiSummary} Further data required for deep-sector projections.`;
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[300px] bg-black/40 border border-color rounded-lg overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
      <div className="p-2 border-b border-color bg-tertiary/40 flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-accent" />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted">A.I. ANALYST LINK</span>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" style={{ background: 'var(--signal-low)' }}></div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-auto space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${m.role === 'ai' ? 'bg-accent/20 text-accent' : 'bg-tertiary text-muted'}`} style={{ color: m.role === 'ai' ? 'var(--accent-secondary)' : '' }}>
              {m.role === 'ai' ? <Cpu size={14} /> : <User size={14} />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-lg text-xs leading-relaxed ${m.role === 'ai' ? 'bg-tertiary/40 text-secondary' : 'bg-accent/10 border border-accent/20 text-primary'}`} style={{ borderColor: m.role === 'user' ? 'rgba(14, 165, 233, 0.2)' : '' }}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded bg-accent/20 text-accent flex items-center justify-center">
              <Cpu size={14} className="animate-pulse" />
            </div>
            <div className="bg-tertiary/40 p-3 rounded-lg text-[10px] text-muted font-mono animate-pulse">
              ANALYZING_DATA_STREAM...
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-tertiary/20 border-t border-color flex gap-2" style={{ borderColor: 'var(--border-color)' }}>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Query intelligence analyst..."
          className="flex-1 bg-black/40 border-none text-xs p-2 rounded focus:ring-1 focus:ring-accent transition-all"
        />
        <button 
          onClick={handleSend}
          className="p-2 bg-accent text-black rounded hover:opacity-80 transition-opacity"
          style={{ background: 'var(--accent-secondary)' }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
