'use client';
import { suggestStartingPrompts } from '@/ai/flows/suggest-starting-prompts';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Plus } from 'lucide-react';
import { createNewChat } from './actions';
import { useEffect, useState } from 'react';
import { useUser } from './user-context';
import type { User } from '@/lib/types';


interface ChatPageProps {
  newChatUsers?: User[];
}


export default function ChatPage({ newChatUsers = [] }: ChatPageProps) {
  const [prompts, setPrompts] = useState<string[]>([]);
  const { user } = useUser();

  useEffect(() => {
    suggestStartingPrompts().then(({ prompts }) => {
      setPrompts(prompts);
    });
  }, []);

  if (!user) {
    return null; // Or a loading state
  }

  const participantIds = newChatUsers.map(u => u.id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-2xl border bg-card/60 backdrop-blur p-8 shadow-sm">
            <h1 className="text-4xl font-headline font-semibold tracking-tight">How can we help today?</h1>
            <p className="mt-2 text-muted-foreground">Start with a prompt below or ask anything.</p>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="mx-auto max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {prompts.slice(0,2).map((prompt, i) => (
                <form action={createNewChat} key={i} className="w-full">
                  <input type="hidden" name="userId" value={user.id} />
                  {participantIds.map(id => <input key={id} type="hidden" name="participantIds" value={id} />)}
                  <input type="hidden" name="message" value={prompt} />
                  <button
                    type="submit"
                    className="w-full rounded-xl border bg-card/60 backdrop-blur p-4 text-left text-sm transition-all hover:bg-muted shadow-sm"
                  >
                    {prompt}
                  </button>
                </form>
              ))}
            </div>
          <form
            action={createNewChat}
            className="relative"
          >
            <input type="hidden" name="userId" value={user.id} />
            {participantIds.map(id => <input key={id} type="hidden" name="participantIds" value={id} />)}
            <Textarea
              name="message"
              placeholder="Ask anything"
              className="min-h-[52px] rounded-2xl border-2 border-red-900 bg-[#1a0b0b] text-red-50 placeholder:text-red-200/50 pl-12 pr-12 shadow-sm focus-visible:ring-2 focus-visible:ring-red-600"
              required
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg border h-8 w-8">
              <Plus className="h-5 w-5 text-muted-foreground"/>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
