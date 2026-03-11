'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, X, ArrowUp, Zap, AlertTriangle, Layers, ListChecks } from 'lucide-react';
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
          'fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full',
          'bg-gradient-to-br from-accent-500 to-pink-500 text-white shadow-lg',
          'hover:shadow-[0_0_24px_rgba(168,85,247,0.5)] transition-all duration-200',
          'group',
          open && 'scale-0 opacity-0 pointer-events-none'
        )}
        title="Open Cortex Assistant (Cmd+J)"
      >
        <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110" />
        <span className="absolute -top-8 right-0 hidden rounded bg-bg-elevated px-2 py-1 text-[10px] font-mono text-text-tertiary shadow group-hover:block whitespace-nowrap">
          Cmd+J
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 flex h-screen w-[420px] flex-col',
          'border-l border-accent-500/20 bg-bg-surface/95 backdrop-blur-xl',
          'shadow-[-8px_0_32px_rgba(0,0,0,0.3),_-2px_0_8px_rgba(168,85,247,0.1)]',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-accent-500/15 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent-500/20 to-pink-500/20">
              <Sparkles className="h-4 w-4 text-accent-400" />
            </div>
            <h2 className="text-sm font-semibold text-text-primary">Cortex Assistant</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-bg-elevated hover:text-text-secondary transition-colors"
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
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-accent-500/20 to-pink-500/20">
                    <Sparkles className="h-3 w-3 text-accent-400" />
                  </div>
                  <div className="rounded-lg bg-bg-elevated/60 px-3 py-2">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-accent-500/15 px-4 py-3">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Cortex anything..."
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border border-border-subtle bg-bg-elevated/50 px-3 py-2.5 pr-10',
                'text-sm text-text-primary placeholder:text-text-tertiary',
                'outline-none transition-all duration-200',
                'focus:border-accent-500/50 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)]',
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
                'absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-md transition-all',
                input.trim() && !isLoading
                  ? 'bg-accent-500 text-white hover:bg-accent-600'
                  : 'text-text-tertiary cursor-not-allowed'
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-1.5 text-center text-[10px] text-text-tertiary">
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
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/20 to-pink-500/20 mb-4">
        <Sparkles className="h-6 w-6 text-accent-400" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">
        Hey! I&apos;m your Cortex assistant.
      </h3>
      <p className="text-sm text-text-secondary mb-6">I can help you:</p>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => onQuickAction(action.label)}
            className={cn(
              'flex items-center gap-2.5 rounded-lg border border-border-subtle px-3 py-2.5',
              'text-left text-sm text-text-secondary',
              'hover:border-accent-500/30 hover:bg-accent-500/5 hover:text-text-primary',
              'transition-all duration-150'
            )}
          >
            <action.icon className="h-4 w-4 shrink-0 text-accent-400" />
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
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-accent-500/20 to-pink-500/20 mt-0.5">
          <Sparkles className="h-3 w-3 text-accent-400" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-accent-600/80 text-white'
            : 'bg-bg-elevated/60 text-text-primary border border-border-subtle/50'
        )}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <time className={cn('mt-1 block text-[10px]', isUser ? 'text-white/50' : 'text-text-tertiary')}>
          {formatTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-bounce [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-bounce [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-bounce [animation-delay:300ms]" />
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
