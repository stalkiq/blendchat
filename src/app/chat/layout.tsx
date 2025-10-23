'use client';
import * as React from 'react';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChats, users } from '@/lib/data';
import { ChevronsUpDown, MessageSquarePlus, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import type { Chat, User } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserProvider, useUser } from './user-context';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { user, setUser } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const chatId = params.id as string | undefined;

  const [newChatUsers, setNewChatUsers] = useState<User[]>([user]);

  useEffect(() => {
    // In a real app, this would be a single user from auth
    setNewChatUsers([user]);
  }, [user]);

  const currentChat = useMemo(() => {
    if (!chatId) return null;
    return chats.find(c => c.id === chatId);
  }, [chatId, chats]);

  useEffect(() => {
    setChats(getChats());
  }, []);

  const createNewChat = () => {
    router.push('/chat');
  };

  const handleNewChatUserToggle = (participant: User) => {
    setNewChatUsers(prev => {
      if (prev.find(p => p.id === participant.id)) {
        return prev.filter(p => p.id !== participant.id);
      }
      return [...prev, participant];
    });
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="hidden h-full w-72 flex-col border-r bg-card text-card-foreground md:flex">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3 flex-1">
            <UserAvatar user={user} />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={createNewChat}
            title="New chat"
          >
            <MessageSquarePlus className="h-5 w-5" />
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
          {currentChat ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                <span>Participants</span>
              </div>
              <div className="flex items-center -space-x-2">
                {currentChat.users.map(u => (
                  <UserAvatar key={u.id} user={u} className="border-2 border-card" />
                ))}
              </div>
            </div>
          ) : (
             <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Users ({newChatUsers.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Select Participants</h4>
                  <p className="text-sm text-muted-foreground">
                    Select users to include in the new chat.
                  </p>
                </div>
                 <div className="mt-4 space-y-2">
                  {users.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${participant.id}`}
                        checked={newChatUsers.some(p => p.id === participant.id)}
                        onCheckedChange={() => handleNewChatUserToggle(participant)}
                        disabled={participant.id === user.id}
                      />
                      <Label htmlFor={`user-${participant.id}`} className="flex items-center gap-2 font-normal">
                         <UserAvatar user={participant} className="h-6 w-6" />
                         {participant.name}
                      </Label>
                    </div>
                  ))}
                 </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </aside>
      <main className="flex h-full flex-1 flex-col">{React.cloneElement(children as React.ReactElement, { newChatUsers })}</main>
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
