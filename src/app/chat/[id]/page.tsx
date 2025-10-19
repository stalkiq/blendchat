import { sendMessage } from '@/app/chat/actions';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { getAuthUser } from '@/lib/auth';
import { getChat } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowUp, Bot } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function ChatSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const chat = getChat(params.id);
  const currentUser = await getAuthUser();

  if (!chat || !currentUser) {
    return notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-semibold font-headline">{chat.title}</h2>
      </header>
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
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
                className={cn('flex items-start gap-4', {
                  'justify-end': messageType === 'user',
                })}
              >
                {messageType !== 'user' && (
                  <div className="flex-shrink-0">
                    {messageType === 'ai' ? (
                      <Avatar className="h-8 w-8 bg-accent text-accent-foreground">
                        <AvatarFallback>
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <UserAvatar user={senderUser} />
                    )}
                  </div>
                )}
                <div
                  className={cn('max-w-md rounded-lg p-3', {
                    'bg-primary text-primary-foreground': messageType === 'user',
                    'bg-muted': messageType !== 'user',
                  })}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                 {messageType === 'user' && (
                  <div className="flex-shrink-0">
                    <UserAvatar user={senderUser} />
                  </div>
                 )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="border-t bg-background p-4">
        <form
          action={sendMessage}
          className="relative mx-auto max-w-2xl"
        >
          <input type="hidden" name="chatId" value={chat.id} />
          <Textarea
            name="message"
            placeholder="Type your message..."
            className="min-h-[44px] rounded-full border-2 pl-4 pr-16"
            required
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// Add a dummy Avatar component to satisfy the compiler
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
