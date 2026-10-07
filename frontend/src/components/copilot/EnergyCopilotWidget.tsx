import React, { useState } from 'react';
import { Bot, Send, Sparkles, CheckCircle2, ChevronRight, HelpCircle, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  evidence?: Array<{ metric: string; measuredValue: string; baseline: string; note?: string }>;
  recommendations?: string[];
  suggestedFollowUps?: string[];
  timestamp: string;
}

export const EnergyCopilotWidget: React.FC<{ initialQuery?: string }> = ({ initialQuery }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Hello, I am **Energy Copilot**. I analyze measured building telemetry across EnergyTwin Tower to uncover efficiency leaks, verify equipment baselines, and calculate evidence-backed energy savings without inventing measurements.',
      evidence: [
        { metric: 'Telemetry Sources', measuredValue: '24 Meters, 120 Assets', baseline: '100% Monitored' },
        { metric: 'Active Anomaly Confidence', measuredValue: '94% on HVAC-03', baseline: 'Exceeding rated limits' }
      ],
      recommendations: [
        'Explore predefined inquiries below or type a query about equipment, peak load, or floors.'
      ],
      suggestedFollowUps: [
        'Why did energy increase today?',
        'Which floor consumes the most?',
        'Which equipment is inefficient?',
        'What are my biggest energy-saving opportunities?'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);

  const predefinedQueries = [
    'Why did energy increase today?',
    'Which floor consumes the most?',
    'Which equipment is inefficient?',
    'How can I reduce peak demand?',
    'What caused this anomaly?',
    'What are my biggest energy-saving opportunities?',
    'Compare this week with last week.'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await api.askCopilot(textToSend);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        evidence: response.evidence,
        recommendations: response.recommendations,
        suggestedFollowUps: response.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to communicate with the Copilot reasoning engine. Please verify the backend connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Energy Copilot
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Ground-Truth AI
              </span>
            </h3>
            <p className="text-xs text-slate-500">Evidence-based building energy reasoning</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero Hallucination Policy</span>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Quick Ask:
        </span>
        {predefinedQueries.slice(0, 4).map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="flex-shrink-0 text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs'
              }`}
            >
              {/* Message text with basic markdown bold rendering */}
              <div
                className="whitespace-pre-wrap font-sans"
                dangerouslySetInnerHTML={{
                  __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }}
              />

              {/* Evidence Citation Table (For Assistant responses) */}
              {m.evidence && m.evidence.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Platform Measured Evidence
                  </span>
                  <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                    {m.evidence.map((ev, eIdx) => (
                      <div key={eIdx} className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-700">{ev.metric}</span>
                        <div className="text-right">
                          <span className="font-bold font-mono text-slate-900">{ev.measuredValue}</span>
                          <span className="text-[10px] text-slate-400 block">{ev.baseline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable recommendations */}
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Actions
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {m.recommendations.map((rec, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested follow ups */}
              {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                  {m.suggestedFollowUps.map((su, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(su)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors"
                    >
                      {su} →
                    </button>
                  ))}
                </div>
              )}

              <span
                className={`text-[9px] mt-2 block ${
                  m.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 max-w-sm">
            <Bot className="w-4 h-4 text-blue-600 animate-spin" />
            <span>Cross-referencing building telemetry and sensor historical logs...</span>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about floor consumption, HVAC-03 fault, peak charges, or savings..."
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
