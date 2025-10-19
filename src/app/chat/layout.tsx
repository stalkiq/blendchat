import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChats, users } from '@/lib/data';
import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { createNewChat } from './actions';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For demo purposes, we'll just use the first user as the current user.
  const user = users[0];
  const chats = getChats();

  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="hidden h-full w-72 flex-col bg-card text-card-foreground md:flex">
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
            <form action={createNewChat} className="w-full">
                <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageSquarePlus className="h-5 w-5"/>
                    <span className="font-semibold">New chat</span>
                </Button>
            </form>
        </div>
        <ScrollArea className="flex-1">
            <nav className="grid items-start p-2 text-sm font-medium">
              {chats.map(chat => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted/50 hover:text-primary"
                >
                  {chat.title}
                </Link>
              ))}
            </nav>
        </ScrollArea>
        <div className="mt-auto border-t border-border/50 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} />
            <div className="flex flex-col">
              <span className="font-semibold">{user.name}</span>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex h-full flex-1 flex-col">{children}</main>
    </div>
  );
}
