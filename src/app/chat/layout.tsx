'use client';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChats, users } from '@/lib/data';
import { ChevronsUpDown, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Chat } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserProvider, useUser } from './user-context';
import { cn } from '@/lib/utils';

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { user, setUser } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const chatId = params.id;

  useEffect(() => {
    setChats(getChats());
  }, []);

  const createNewChat = () => {
    router.push('/chat');
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="hidden h-full w-72 flex-col border-r bg-card text-card-foreground md:flex">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={createNewChat}
          >
            <MessageSquarePlus className="h-5 w-5" />
            <span className="font-semibold">New chat</span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid items-start p-2 text-sm font-medium">
            {chats.map(chat => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted/50 hover:text-primary',
                  chatId === chat.id && 'bg-muted/50 text-primary'
                )}
              >
                {chat.title}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="mt-auto border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} />
                  <span className="font-semibold">{user.name}</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
              {users.map(u => (
                <DropdownMenuItem key={u.id} onClick={() => setUser(u)}>
                  <div className="flex items-center gap-3">
                    <UserAvatar user={u} />
                    <span>{u.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <main className="flex h-full flex-1 flex-col">{children}</main>
    </div>
  );
}


export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </UserProvider>
  );
}
