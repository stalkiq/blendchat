'use client';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { getChat } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowUp, Bot, Plus } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import type { Chat } from '@/lib/types';
import { useUser } from '../user-context';

export default function ChatSessionPage() {
  const [chat, setChat] = useState<Chat | undefined>(undefined);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const params = useParams();
  const chatId = params.id as string;
  const { user: currentUser } = useUser();

  useEffect(() => {
    // This is a client-side data fetch for the demo.
    // In a real app, you'd fetch this from a database, likely in a server component.
    const chatData = getChat(chatId);
    if (!chatData) {
      // If no chat is found, redirect to the new chat page.
      // This prevents 404 errors on refresh or with invalid IDs.
      router.replace('/chat');
    } else {
      setChat(chatData);
    }
  }, [chatId, router]);

  if (!chat || !currentUser) {
    // You might want a loading state here
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center border-b px-6 shrink-0">
        <h2 className="text-xl font-headline font-semibold tracking-tight mx-auto max-w-4xl w-full text-center">
          {chat.title}
        </h2>
      </header>
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6 max-w-4xl mx-auto w-full">
          {chat.messages.map(message => {
            const senderUser =
              message.sender === 'user' || message.sender === 'other'
                ? message.user
                : undefined;

            const isCurrentUser = senderUser?.id === currentUser.id;
            const messageType = isCurrentUser ? 'user' : message.sender;

            return (
              <div
                key={message.id}
                className={cn('flex items-start gap-4')}
              >
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-card/60 border flex items-center justify-center shadow-sm">
                  {messageType === 'ai' ? (
                    <Bot className="h-5 w-5" />
                  ) : (
                    <UserAvatar user={senderUser} />
                  )}
                </div>
                <div className={cn('flex-1 pt-1')}>
                  <p className="font-medium mb-1">
                    {messageType === 'user'
                      ? 'You'
                      : messageType === 'other'
                      ? senderUser?.name
                      : 'AI Assistant'}
                  </p>
                  <p className="text-[0.95rem] leading-6 text-foreground/90 whitespace-pre-wrap">
                    {message.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="px-4 pb-4">
        <div className="mx-auto max-w-4xl">
          <form
            ref={formRef}
            onSubmit={async e => {
              e.preventDefault();
              const form = formRef.current;
              if (!form) return;
              const formData = new FormData(form);
              const prompt = (formData.get('message') as string) || '';
              if (!prompt.trim()) return;

              // Optimistically render user's message
              setChat(prev => {
                if (!prev) return prev;
                const next: Chat = {
                  ...prev,
                  messages: [
                    ...prev.messages,
                    {
                      id: `msg-${Date.now()}`,
                      text: prompt,
                      createdAt: new Date().toISOString(),
                      sender: 'user',
                      user: currentUser,
                    },
                    {
                      id: `msg-${Date.now()+1}`,
                      text: '',
                      createdAt: new Date().toISOString(),
                      sender: 'ai',
                    },
                  ],
                } as Chat;
                return next;
              });

              // Build history for the API
              const history = (getChat(chatId)?.messages || []).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text,
              }));

              try {
                const res = await fetch('/api/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ history, prompt }),
                });

                if (res.headers.get('content-type')?.includes('text/event-stream') && res.body) {
                  const reader = res.body.getReader();
                  const decoder = new TextDecoder();
                  let buffer = '';
                  // Append tokens to the last AI message as they arrive
                  const append = (chunk: string) => {
                    setChat(prev => {
                      if (!prev) return prev;
                      const msgs = [...prev.messages];
                      for (let i = msgs.length - 1; i >= 0; i--) {
                        if (msgs[i].sender === 'ai') {
                          msgs[i] = { ...msgs[i], text: msgs[i].text + chunk } as any;
                          break;
                        }
                      }
                      return { ...prev, messages: msgs } as Chat;
                    });
                  };

                  while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split('\n\n');
                    buffer = parts.pop() || '';
                    for (const part of parts) {
                      const line = part.trim();
                      if (!line.startsWith('data: ')) continue;
                      const data = line.slice(6);
                      if (data === '[DONE]') continue;
                      try {
                        const json = JSON.parse(data);
                        const delta = json.choices?.[0]?.delta?.content || '';
                        if (delta) append(delta);
                      } catch {}
                    }
                  }
                } else {
                  const json = await res.json().catch(() => ({}));
                  const text = json.reply || '';
                  setChat(prev => {
                    if (!prev) return prev;
                    const msgs = [...prev.messages];
                    for (let i = msgs.length - 1; i >= 0; i--) {
                      if (msgs[i].sender === 'ai') {
                        msgs[i] = { ...msgs[i], text } as any;
                        break;
                      }
                    }
                    return { ...prev, messages: msgs } as Chat;
                  });
                }
              } catch {}

              formRef.current?.reset();
            }}
            className="relative"
          >
            <input type="hidden" name="chatId" value={chat.id} />
            <input type="hidden" name="userId" value={currentUser.id} />
            <Textarea
              name="message"
              placeholder="Ask anything"
              className="min-h-[56px] rounded-2xl border-2 border-red-900 bg-[#1a0b0b]/90 text-red-50 placeholder:text-red-200/50 pl-12 pr-12 shadow-sm backdrop-blur focus-visible:ring-2 focus-visible:ring-red-600"
              required
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg border h-8 w-8">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
