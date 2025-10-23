'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Plus, Bot, UserPlus } from 'lucide-react';
import { createNewChat } from './actions';
import { useState } from 'react';
import { useUser } from './user-context';
import type { User } from '@/lib/types';
import { users as availableUsers } from '@/lib/data';
import { UserAvatar } from '@/components/user-avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ChatPageProps {
  newChatUsers?: User[];
}

export default function ChatPage({ newChatUsers = [] }: ChatPageProps) {
  const { user } = useUser();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([user]);
  const [includeGPT, setIncludeGPT] = useState(true);

  if (!user) {
    return null;
  }

  const handleUserToggle = (selectedUser: User) => {
    setSelectedUsers(prev => {
      if (prev.find(u => u.id === selectedUser.id)) {
        // Don't allow removing the current user
        if (selectedUser.id === user.id) return prev;
        return prev.filter(u => u.id !== selectedUser.id);
      }
      return [...prev, selectedUser];
    });
  };

  const participantIds = selectedUsers.map(u => u.id);

  return (
    <div className="flex h-full flex-col">
      {/* Main content area - Group Chat Setup */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex h-full max-w-3xl flex-col justify-center">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-headline font-semibold tracking-tight">Start a Group Chat</h1>
            <p className="mt-2 text-muted-foreground">Select participants and start collaborating</p>
          </div>

          {/* Group Chat Setup Card */}
          <div className="rounded-2xl border bg-card/60 backdrop-blur p-6 shadow-lg">
            {/* Selected Participants Display */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Selected Participants ({selectedUsers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
                    <UserAvatar user={u} className="h-6 w-6" />
                    <span className="text-sm">{u.name}</span>
                  </div>
                ))}
                {includeGPT && (
                  <div className="flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1.5">
                    <Bot className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">GPT Assistant</span>
                  </div>
                )}
              </div>
            </div>

            {/* Add Users Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add People to Chat
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {availableUsers.map(availableUser => (
                  <div key={availableUser.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={`user-${availableUser.id}`}
                      checked={selectedUsers.some(u => u.id === availableUser.id)}
                      onCheckedChange={() => handleUserToggle(availableUser)}
                      disabled={availableUser.id === user.id}
                    />
                    <Label
                      htmlFor={`user-${availableUser.id}`}
                      className="flex items-center gap-3 font-normal flex-1 cursor-pointer"
                    >
                      <UserAvatar user={availableUser} className="h-8 w-8" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{availableUser.name}</span>
                        <span className="text-xs text-muted-foreground">{availableUser.email}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Include GPT Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Include GPT in conversation</p>
                  <p className="text-xs text-muted-foreground">AI will respond to messages</p>
                </div>
              </div>
              <Checkbox
                id="include-gpt"
                checked={includeGPT}
                onCheckedChange={(checked) => setIncludeGPT(checked as boolean)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="px-4 pb-4">
        <div className="mx-auto max-w-3xl">
          <form action={createNewChat} className="relative">
            <input type="hidden" name="userId" value={user.id} />
            {participantIds.map(id => <input key={id} type="hidden" name="participantIds" value={id} />)}
            <Textarea
              name="message"
              placeholder="Type your first message to start the chat..."
              className="min-h-[60px] rounded-2xl border-2 border-red-900 bg-[#1a0b0b] text-red-50 placeholder:text-red-200/50 pl-12 pr-12 py-4 shadow-sm focus-visible:ring-2 focus-visible:ring-red-600 resize-none"
              required
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg h-10 w-10"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg border h-8 w-8 bg-background">
              <Plus className="h-4 w-4 text-muted-foreground"/>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
