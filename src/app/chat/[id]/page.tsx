'use client';

import { sendMessage } from '@/app/chat/actions';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { getChat, users } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowUp, Bot, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import type { Chat } from '@/lib/types';

export default function ChatSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const [chat, setChat] = useState<Chat | undefined>(undefined);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { id: chatId } = params;

  // For demo purposes, we'll just use the first user as the current user.
  const currentUser = users[0];

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
        <h2 className="text-xl font-semibold font-headline">{chat.title}</h2>
      </header>
      <ScrollArea className="flex-1">
        <div className="space-y-8 p-6 max-w-2xl mx-auto w-full">
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
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {messageType === 'ai' ? (
                    <Bot className="h-5 w-5" />
                  ) : (
                    <UserAvatar user={senderUser} />
                  )}
                </div>
                <div className={cn('flex-1 pt-1')}>
                  <p className="font-semibold mb-1">
                    {messageType === 'user'
                      ? 'You'
                      : messageType === 'other'
                      ? senderUser?.name
                      : 'AI Assistant'}
                  </p>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {message.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="px-4 pb-4">
        <div className="mx-auto max-w-2xl">
          <form
            ref={formRef}
            action={async formData => {
              await sendMessage(formData);
              formRef.current?.reset();
            }}
            className="relative"
          >
            <input type="hidden" name="chatId" value={chat.id} />
            <Textarea
              name="message"
              placeholder="Ask anything"
              className="min-h-[52px] rounded-2xl border-2 border-border bg-background pl-12 pr-12 shadow-sm"
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
