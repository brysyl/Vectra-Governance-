import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Send, 
  Sparkles, 
  Trash2, 
  Cpu
} from 'lucide-react';
import { Incident, Microservice } from '../types';

interface Message {
  id: string;
  sender: 'USER' | 'VECTRA_COPILOT';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

interface SreTerminalProps {
  services: Microservice[];
  activeIncident: Incident | null;
  totalBurnRate: number;
}

export const SreTerminal: React.FC<SreTerminalProps> = ({
  services,
  activeIncident,
  totalBurnRate,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      sender: 'VECTRA_COPILOT',
      text: `[VECTRA.GOV SRE COPILOT CLI INITIALIZED]
Connected to cluster: gke-prod-us-central1 (7 nodes active).
Model Armor Semantic Firewall: ZERO-TRUST ACTIVE.
Enter natural language queries or CLI commands to inspect telemetry, run diagnostics, or orchestrate autonomous tool calls.`,
      timestamp: '00:00:01',
      suggestedActions: [
        'Run cluster health diagnosis',
        'Inspect current FinOps burn rate',
        'Verify Model Armor zero-trust policies'
      ],
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/natural-language-sre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          activeState: {
            incidents: activeIncident ? [activeIncident] : [],
            services,
            totalBurnRate,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'VECTRA_COPILOT',
        text: data.reply || "Command evaluated successfully.",
        timestamp: new Date().toLocaleTimeString(),
        suggestedActions: data.suggestedActions,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'VECTRA_COPILOT',
        text: `[VECTRA ERROR] Failed to evaluate command: ${err.message || 'Network error'}. Fallback local SRE engine active.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'VECTRA_COPILOT',
        text: '[CONSOLE CLEARED] Vectra SRE Copilot ready.',
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  };

  return (
    <div id="sre-terminal-view" className="bg-[#121215] border border-[#27272A] flex flex-col h-[640px]">
      {/* Terminal Title Bar */}
      <div className="bg-[#0A0A0C] px-5 py-3 border-b border-[#27272A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 bg-rose-500"></div>
            <div className="w-2.5 h-2.5 bg-amber-500"></div>
            <div className="w-2.5 h-2.5 bg-emerald-500"></div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-white font-bold">
            <TerminalIcon className="w-3.7 h-3.7 text-[#00F0FF]" />
            <span>TERMINAL.ACTIVE // VECTRA SRE COPILOT</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 border border-emerald-500/40 font-bold">
            <Cpu className="w-3 h-3" />
            GEMINI 3.7 PRO
          </span>
          <button
            onClick={handleClear}
            className="p-1 text-[#888] hover:text-white transition-colors cursor-pointer"
            title="Clear Console"
          >
            <Trash2 className="w-3.7 h-3.7" />
          </button>
        </div>
      </div>

      {/* Message Output Window */}
      <div className="flex-1 p-6 overflow-y-auto font-mono text-xs space-y-4 bg-[#0A0A0C] select-text">
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER';
          return (
            <div key={msg.id} className={`space-y-1.5 ${isUser ? 'text-[#00F0FF]' : 'text-[#CCC]'}`}>
              <div className="flex items-center gap-2 text-[10px] text-[#666]">
                <span>[{msg.timestamp}]</span>
                <span className={isUser ? 'text-[#00F0FF] font-bold' : 'text-emerald-400 font-bold'}>
                  {isUser ? 'USER@DEVOPS' : 'VECTRA_ENGINE'}
                </span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed bg-[#121215] p-3.7 border border-[#27272A]">
                {msg.text}
              </div>

              {/* Suggested Action Chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(action)}
                      className="px-2.5 py-1 bg-[#18181D] hover:bg-[#222228] text-[#AAA] hover:text-[#00F0FF] text-[10px] font-mono border border-[#27272A] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#00F0FF]" />
                      <span>{action}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-[#00F0FF] py-2 font-mono text-xs">
            <Cpu className="w-3.7 h-3.7 animate-spin text-[#00F0FF]" />
            <span>Gemini SRE Agent evaluating cluster telemetry & AST tool calls...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-[#0A0A0C] border-t border-[#27272A]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1 font-mono">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00F0FF] text-xs select-none font-bold">
              &gt;
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type an SRE query or command (e.g., 'Diagnose why latency is high' or 'Rollback canary')..."
              className="w-full bg-[#121215] border border-[#27272A] pl-8 pr-4 py-2.5 text-xs text-white font-mono placeholder-[#555] focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#00F0FF] hover:bg-[#33F4FF] disabled:opacity-40 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_10px_#00F0FF] transition-all cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span className="hidden sm:inline">Execute</span>
          </button>
        </form>
      </div>
    </div>
  );
};
