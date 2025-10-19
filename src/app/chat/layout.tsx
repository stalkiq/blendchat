import { logout } from '@/app/auth/actions';
import { Logo } from '@/components/logo';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAuthUser } from '@/lib/auth';
import { getChats } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Home, LogOut, MessageSquarePlus, Settings } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createNewChat } from './actions';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const chats = getChats();

  return (
    <div className="flex h-screen w-full bg-card">
      <aside className="hidden h-full w-72 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Logo />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between p-2">
            <h2 className="px-2 text-lg font-semibold tracking-tight font-headline">
                Conversations
            </h2>
            <form action={createNewChat}>
                <Button variant="ghost" size="icon">
                    <MessageSquarePlus className="h-5 w-5"/>
                </Button>
            </form>
          </div>
          <ScrollArea className="flex-1">
            <nav className="grid items-start p-2 text-sm font-medium">
              {chats.map(chat => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  {chat.title}
                </Link>
              ))}
            </nav>
          </ScrollArea>
        </div>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} />
            <div className="flex flex-col">
              <span className="font-semibold">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            <form action={logout} className="ml-auto">
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex h-full flex-1 flex-col">{children}</main>
    </div>
  );
}
