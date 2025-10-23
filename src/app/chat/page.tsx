'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Plus, Bot, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) {
    return null;
  }

  const handleUserToggle = (selectedUser: User) => {
    setSelectedUsers(prev => {
      if (prev.find(u => u.id === selectedUser.id)) {
        if (selectedUser.id === user.id) return prev;
        return prev.filter(u => u.id !== selectedUser.id);
      }
      return [...prev, selectedUser];
    });
  };

  const participantIds = selectedUsers.map(u => u.id);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-black p-6">
      {/* Integrated Red Chat Box with Participants */}
      <div className="w-full max-w-3xl">
        <div className="rounded-2xl border-2 border-red-900 bg-[#1a0b0b] shadow-2xl overflow-hidden">
            {/* Participants Section - Top of Red Box */}
            <div className="border-b border-red-900/50 bg-[#0d0505]">
              {/* Selected Participants Bar */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                  <span className="text-xs text-red-200/70 font-medium whitespace-nowrap">TO:</span>
                  {selectedUsers.map(u => (
                    <div
                      key={u.id}
                      className="flex items-center gap-1.5 rounded-full bg-red-900/30 border border-red-800/50 px-2 py-1 shrink-0"
                    >
                      <UserAvatar user={u} className="h-5 w-5" />
                      <span className="text-xs text-red-100">{u.name}</span>
                    </div>
                  ))}
                  {includeGPT && (
                    <div className="flex items-center gap-1.5 rounded-full bg-red-900/50 border border-red-700/50 px-2 py-1 shrink-0">
                      <Bot className="h-4 w-4 text-red-300" />
                      <span className="text-xs text-red-100 font-medium">GPT</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 text-red-300 hover:text-red-100 hover:bg-red-900/30 shrink-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Expandable Participants Selector */}
              {isExpanded && (
                <div className="border-t border-red-900/50 bg-[#0a0404] p-4 max-h-[280px] overflow-y-auto">
                  <div className="space-y-3">
                    {/* GPT Toggle */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-red-900/20 border border-red-800/30">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-red-300" />
                        <div>
                          <p className="text-sm font-medium text-red-100">Include GPT Assistant</p>
                          <p className="text-xs text-red-300/70">AI will respond in conversation</p>
                        </div>
                      </div>
                      <Checkbox
                        id="include-gpt"
                        checked={includeGPT}
                        onCheckedChange={(checked) => setIncludeGPT(checked as boolean)}
                        className="border-red-700 data-[state=checked]:bg-red-600"
                      />
                    </div>

                    {/* User List */}
                    <div className="space-y-2">
                      <p className="text-xs text-red-300/70 font-medium uppercase tracking-wider">
                        Add People
                      </p>
                      {availableUsers.map(availableUser => (
                        <div
                          key={availableUser.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                        >
                          <Checkbox
                            id={`user-${availableUser.id}`}
                            checked={selectedUsers.some(u => u.id === availableUser.id)}
                            onCheckedChange={() => handleUserToggle(availableUser)}
                            disabled={availableUser.id === user.id}
                            className="border-red-700 data-[state=checked]:bg-red-600"
                          />
                          <Label
                            htmlFor={`user-${availableUser.id}`}
                            className="flex items-center gap-3 font-normal flex-1 cursor-pointer"
                          >
                            <UserAvatar user={availableUser} className="h-7 w-7" />
                            <div className="flex flex-col">
                              <span className="text-sm text-red-100">{availableUser.name}</span>
                              <span className="text-xs text-red-300/60">{availableUser.email}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input Area - Bottom of Red Box */}
            <form action={createNewChat} className="relative p-4">
              <input type="hidden" name="userId" value={user.id} />
              {participantIds.map(id => <input key={id} type="hidden" name="participantIds" value={id} />)}
              
              <Textarea
                name="message"
                placeholder="Type your first message to start the chat..."
                className="min-h-[80px] bg-transparent border-0 text-red-50 placeholder:text-red-200/40 pl-12 pr-12 py-3 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
              
              {/* Submit Button */}
              <Button
                type="submit"
                size="icon"
                className="absolute right-6 bottom-6 rounded-lg h-10 w-10 bg-red-600 hover:bg-red-700"
              >
                <ArrowUp className="h-5 w-5" />
              </Button>

              {/* Plus Button */}
              <div className="absolute left-6 bottom-6 flex items-center justify-center rounded-lg border border-red-800/50 h-8 w-8 bg-red-950/50">
                <Plus className="h-4 w-4 text-red-300" />
              </div>
            </form>
        </div>

        {/* Helper Text */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          {selectedUsers.length} participant{selectedUsers.length !== 1 ? 's' : ''} selected
          {includeGPT && ' • GPT enabled'}
        </p>
      </div>
    </div>
  );
}
