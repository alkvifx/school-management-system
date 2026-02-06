'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '@/src/services/ai.service';
import { useAuth } from '@/src/context/auth.context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Trash2, Send, Bot, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Simple markdown-like renderer (safe, no HTML): newlines, **bold**, `code`
function renderMarkdown(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-sm">$1</code>')
    .replace(/\n/g, '<br/>');
}

const SUGGESTIONS = [
  'Explain this topic',
  'Solve this question',
  'Give example',
  'Make notes',
  'Create practice questions',
];

export default function AiChatBox({ role = 'STUDENT', greeting = 'Ask your doubts 📚', emptyMessage = 'Your AI doubt solver is ready 🚀 Ask anything about your studies.' }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef(null);

  const userRole = role || user?.role || 'STUDENT';

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const { success, data } = await aiService.getChatHistory();
      if (success && Array.isArray(data)) {
        const reversed = [...data].reverse();
        const mapped = reversed.flatMap((h) => [
          { type: 'user', content: h.message, createdAt: h.createdAt },
          { type: 'ai', content: h.aiResponse, createdAt: h.createdAt },
        ]);
        setMessages(mapped);
      }
    } catch (err) {
      console.error('Load AI history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const sendMessage = async (text) => {
    const toSend = (text || input).trim().slice(0, 500);
    if (!toSend || loading) return;

    setInput('');
    const userMsg = { type: 'user', content: toSend, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();

    setLoading(true);
    const aiPlaceholder = { type: 'ai', content: '', isLoading: true };
    setMessages((prev) => [...prev, aiPlaceholder]);
    scrollToBottom();

    try {
      const res = await aiService.sendChat(toSend, userRole);
      const aiContent = res?.data?.aiResponse || res?.aiResponse || 'AI is busy right now, please try again in a moment.';
      const aiMsg = { type: 'ai', content: aiContent, createdAt: res?.data?.createdAt || new Date().toISOString() };
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(aiMsg));
      if (res?.warning) toast.warning(res.warning);
    } catch (err) {
      const fallback = { type: 'ai', content: 'AI is busy right now, please try again in a moment.', createdAt: new Date().toISOString() };
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(fallback));
      toast.error(err.response?.data?.message || 'Failed to get AI response');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (s) => {
    setInput(s);
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'));
  };

  if (loadingHistory) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[600px] rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-center flex-1 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-500">Loading chat history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[600px] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI Help</h2>
            <p className="text-xs text-gray-500">{greeting}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-gray-500 hover:text-red-600">
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="p-4 rounded-2xl bg-blue-50 mb-4">
              <Bot className="h-12 w-12 text-blue-500" />
            </div>
            <p className="text-gray-600 mb-6 max-w-sm">{emptyMessage}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestion(s)}
                  className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-blue-100 text-sm text-gray-700 hover:text-blue-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn('flex gap-3', msg.type === 'user' ? 'flex-row-reverse' : '')}
                >
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  )}>
                    {msg.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn(
                    'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  )}>
                    {msg.isLoading ? (
                      <div className="flex items-center gap-2 py-1">
                        <span className="flex gap-1">
                          {[0, 1, 2].map((j) => (
                            <motion.span
                              key={j}
                              className="w-2 h-2 rounded-full bg-blue-400"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: j * 0.2 }}
                            />
                          ))}
                        </span>
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    ) : msg.type === 'ai' ? (
                      <div className="space-y-2">
                        <div
                          className="prose prose-sm max-w-none text-gray-800 [&_strong]:font-semibold [&_code]:bg-gray-200 [&_code]:px-1 [&_code]:rounded"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                        />
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(msg.content)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copy"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Quick chips when there are messages */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 overflow-x-auto">
          <div className="flex gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestion(s)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-blue-50 text-xs text-gray-600 hover:text-blue-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 500))}
            placeholder="Type your question..."
            rows={1}
            className="min-h-[44px] max-h-32 resize-none"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()} className="self-end shrink-0">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Max 500 characters. Be clear and specific.</p>
      </form>
    </div>
  );
}
