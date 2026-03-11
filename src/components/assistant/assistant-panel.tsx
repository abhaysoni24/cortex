'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Brain, X, ArrowUp, Zap, AlertTriangle, Layers, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui-store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const QUICK_ACTIONS = [
  { label: 'What should I work on today?', icon: Zap },
  { label: "What's blocked?", icon: AlertTriangle },
  { label: 'Summarize my workstreams', icon: Layers },
  { label: 'Help me prioritize', icon: ListChecks },
];

let msgCounter = 0;
function genId() {
  return `msg-${Date.now()}-${++msgCounter}`;
}

export function AssistantPanel() {
  const open = useUIStore((s) => s.assistantPanelOpen);
  const setOpen = useUIStore((s) => s.setAssistantPanelOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = { id: genId(), role: 'user', content: content.trim(), createdAt: new Date() };
    const assistantMsg: Message = { id: genId(), role: 'assistant', content: '', createdAt: new Date() };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, assistantMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const current = accumulated;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: current };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          content: 'Sorry, something went wrong. Please try again.',
        };
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) sendMessage(input);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-none',
          'bg-accent-500 text-black border-2 border-accent-600 shadow-[3px_3px_0_#000]',
          'hover:bg-accent-400 transition-colors',
          'group',
          open && 'scale-0 opacity-0 pointer-events-none'
        )}
        title="Open Cortex Assistant (Cmd+J)"
      >
        <Brain className="h-5 w-5" />
        <span className="absolute -top-8 right-0 hidden rounded-none border-2 border-border-default bg-bg-elevated px-2 py-1 text-[10px] font-mono text-accent-500 shadow-[2px_2px_0_#000] group-hover:block whitespace-nowrap">
          CMD+J
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 flex h-screen w-[420px] flex-col',
          'border-l-2 border-border-default bg-bg-surface',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-border-default px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-none border-2 border-terminal-400 bg-bg-base">
              <Brain className="h-4 w-4 text-terminal-400" />
            </div>
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-accent-500">Cortex AI</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-none border-2 border-transparent text-text-tertiary hover:border-border-default hover:bg-bg-elevated hover:text-text-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <WelcomeState onQuickAction={(text) => sendMessage(text)} />
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none border-2 border-terminal-400 bg-bg-base">
                    <Brain className="h-3 w-3 text-terminal-400" />
                  </div>
                  <div className="rounded-none border-2 border-border-default bg-bg-elevated px-3 py-2">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t-2 border-border-default px-4 py-3">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Cortex anything..."
              rows={1}
              className={cn(
                'w-full resize-none rounded-none border-2 border-border-default bg-bg-base px-3 py-2.5 pr-10',
                'text-sm font-mono text-text-primary placeholder:text-text-tertiary',
                'outline-none transition-colors',
                'focus:border-accent-500',
                'max-h-32'
              )}
              style={{ height: 'auto', minHeight: '40px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-none transition-colors',
                input.trim() && !isLoading
                  ? 'bg-accent-500 text-black border-2 border-accent-600 hover:bg-accent-400'
                  : 'text-text-tertiary border-2 border-transparent cursor-not-allowed'
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-1.5 text-center text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
            Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}

function WelcomeState({ onQuickAction }: { onQuickAction: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-none border-2 border-terminal-400 bg-bg-base mb-4">
        <Brain className="h-6 w-6 text-terminal-400" />
      </div>
      <h3 className="text-base font-bold font-mono uppercase tracking-wider text-accent-500 mb-1">
        Cortex AI
      </h3>
      <p className="text-sm font-mono text-text-secondary mb-6">I can help you:</p>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => onQuickAction(action.label)}
            className={cn(
              'flex items-center gap-2.5 rounded-none border-2 border-border-default px-3 py-2.5',
              'text-left text-sm font-mono text-text-secondary',
              'hover:border-accent-500 hover:text-accent-500',
              'transition-colors'
            )}
          >
            <action.icon className="h-4 w-4 shrink-0 text-terminal-400" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  if (!message.content) return null;

  return (
    <div className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none border-2 border-terminal-400 bg-bg-base mt-0.5">
          <Brain className="h-3 w-3 text-terminal-400" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-none px-3 py-2 text-sm font-mono leading-relaxed',
          isUser
            ? 'bg-accent-500 text-black border-2 border-accent-600'
            : 'bg-bg-elevated text-text-primary border-2 border-border-default'
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <time className={cn('mt-1 block text-[10px]', isUser ? 'text-black/50' : 'text-text-tertiary')}>
          {formatTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      <span className="h-1.5 w-1.5 rounded-none bg-terminal-400 animate-bounce [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 rounded-none bg-terminal-400 animate-bounce [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-none bg-terminal-400 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
