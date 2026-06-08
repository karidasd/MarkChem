import React, { useState, useEffect, useRef } from 'react';
import { Send, Key, Bot, User, Trash2, X } from 'lucide-react';

interface AIAssistantPaneProps {
  currentContext: string;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function AIAssistantPane({ currentContext, onClose }: AIAssistantPaneProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsConfigured(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsConfigured(true);
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsConfigured(false);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !apiKey) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      contents.push({
        role: 'user',
        parts: [{ text: `[System Context: The user is currently working on this document. Use this for context, but do not mention it unless relevant.\n\n${currentContext}]\n\nUser Question: ${userMsg}` }]
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="w-80 h-full bg-slate-100 dark:bg-slate-panels border-l border-slate-borderDark flex flex-col p-6 shrink-0 z-50 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-cyan-accent font-bold text-lg">
            <Bot size={24} />
            Chem AI
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-obsidian rounded text-slate-500">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-slate-800 dark:text-slate-200 font-bold mb-2">Welcome to Chem AI</h3>
          <p className="text-sm text-slate-500 mb-6">
            To use the AI Assistant, please provide your Google Gemini API Key. It will be stored locally in your browser.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your Gemini API Key..."
            className="w-full p-2 mb-4 rounded border border-slate-300 dark:border-slate-borderDark bg-white dark:bg-obsidian text-slate-dark dark:text-slate-light text-sm outline-none focus:border-cyan-accent"
          />
          <button
            onClick={handleSaveKey}
            disabled={!apiKey.trim()}
            className="w-full py-2 bg-cyan-accent text-obsidian font-bold rounded hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            Save Key
          </button>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-center text-cyan-600 dark:text-cyan-400 hover:underline mt-4"
          >
            Get a free API Key here
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 md:w-96 h-full bg-slate-100 dark:bg-slate-panels border-l border-slate-borderDark flex flex-col shrink-0 z-50 shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-slate-borderDark bg-slate-200 dark:bg-obsidian/50">
        <div className="flex items-center gap-2 text-cyan-accent font-bold">
          <Bot size={20} />
          Chem AI
        </div>
        <div className="flex gap-1">
          <button onClick={handleClearKey} title="Remove API Key" className="p-1.5 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors">
            <Key size={14} />
          </button>
          <button onClick={() => setMessages([])} title="Clear Chat" className="p-1.5 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors">
            <Trash2 size={14} />
          </button>
          <button onClick={onClose} title="Close AI" className="p-1.5 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
            <Bot size={48} className="mb-4" />
            <p className="text-sm text-center">I'm your chemistry assistant.<br/>Ask me anything!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-cyan-accent/20 text-cyan-accent'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-cyan-accent text-obsidian' 
                  : 'bg-white dark:bg-obsidian border border-slate-200 dark:border-slate-borderDark text-slate-800 dark:text-slate-200'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-cyan-accent/20 text-cyan-accent animate-pulse">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-obsidian border border-slate-borderDark text-slate-500 text-sm italic">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-borderDark bg-slate-50 dark:bg-obsidian/30">
        <div className="flex relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about chemistry..."
            className="w-full bg-white dark:bg-obsidian border border-slate-300 dark:border-slate-borderDark rounded-lg pl-3 pr-10 py-3 text-sm text-slate-dark dark:text-slate-light resize-none focus:outline-none focus:border-cyan-accent h-[60px]"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-accent disabled:opacity-50 hover:bg-cyan-accent/10 rounded-full transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
