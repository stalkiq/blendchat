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
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-4xl font-semibold text-muted-foreground/80">What can I help with?</h1>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="mx-auto max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              {prompts.slice(0,2).map((prompt, i) => (
                <form action={createNewChat} key={i} className="w-full">
                  <input type="hidden" name="userId" value={user.id} />
                  {participantIds.map(id => <input key={id} type="hidden" name="participantIds" value={id} />)}
                  <input type="hidden" name="message" value={prompt} />
                  <button
                    type="submit"
                    className="w-full rounded-lg border bg-card p-4 text-left text-sm transition-all hover:bg-muted"
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
              className="min-h-[52px] rounded-2xl border-2 border-border bg-background pl-12 pr-12 shadow-sm"
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
