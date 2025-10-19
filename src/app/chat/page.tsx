import { suggestStartingPrompts } from '@/ai/flows/suggest-starting-prompts';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Bot } from 'lucide-react';
import { sendMessage } from './actions';
import { Logo } from '@/components/logo';

export default async function ChatPage() {
  const { prompts } = await suggestStartingPrompts();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full border bg-background p-4 shadow-sm">
                <Logo className="text-2xl" />
            </div>
          <h2 className="text-3xl font-bold font-headline">
            Welcome to Collective Chat
          </h2>
          <p className="text-muted-foreground">
            Start a new conversation or explore some of these ideas.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
            {prompts.map((prompt, i) => (
              <form action={sendMessage} key={i} className="w-full">
                <input type="hidden" name="chatId" value="new-chat" />
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
        </div>
      </div>
      <div className="border-t bg-background p-4">
        <form
          action={sendMessage}
          className="relative mx-auto max-w-2xl"
        >
          <input type="hidden" name="chatId" value="new-chat" />
          <Textarea
            name="message"
            placeholder="What's on your mind?"
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
