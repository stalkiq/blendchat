'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowUp, Plus, Bot, X } from 'lucide-react';
import { useState, useRef, KeyboardEvent } from 'react';
import { useUser } from './user-context';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';

interface ChatPageProps {
  newChatUsers?: any[];
}

export default function ChatPage({ newChatUsers = [] }: ChatPageProps) {
  const { user } = useUser();
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [includeGPT, setIncludeGPT] = useState(true);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleEmailKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addEmail();
    } else if (e.key === 'Backspace' && emailInput === '' && emails.length > 0) {
      // Remove last email if backspace on empty input
      setEmails(prev => prev.slice(0, -1));
    }
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && isValidEmail(email) && !emails.includes(email)) {
      setEmails(prev => [...prev, email]);
      setEmailInput('');
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(prev => prev.filter(e => e !== emailToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Create chat and send invitations
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails,
          message: message.trim(),
          includeGPT,
          creatorEmail: user.email,
          creatorName: user.name,
        }),
      });

      const data = await response.json();

      if (data.chatId) {
        // Redirect to the new chat
        router.push(`/chat/${data.chatId}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-black p-6">
      {/* Integrated Red Chat Box */}
      <div className="w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-red-900 bg-[#1a0b0b] shadow-2xl overflow-hidden">
          {/* Email Recipients Section */}
          <div className="border-b border-red-900/50 bg-[#0d0505]">
            <div className="p-3 flex items-start gap-3">
              <span className="text-xs text-red-200/70 font-medium whitespace-nowrap pt-2">TO:</span>
              <div className="flex-1 flex flex-wrap gap-2 items-center">
                {/* Email chips */}
                {emails.map(email => (
                  <div
                    key={email}
                    className="flex items-center gap-1.5 rounded-full bg-red-900/30 border border-red-800/50 px-3 py-1 group"
                  >
                    <span className="text-xs text-red-100">{email}</span>
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="hover:bg-red-800/50 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3 text-red-300" />
                    </button>
                  </div>
                ))}

                {/* GPT chip */}
                {includeGPT && (
                  <div className="flex items-center gap-1.5 rounded-full bg-red-900/50 border border-red-700/50 px-3 py-1">
                    <Bot className="h-4 w-4 text-red-300" />
                    <span className="text-xs text-red-100 font-medium">GPT</span>
                  </div>
                )}

                {/* Email input */}
                <Input
                  ref={emailInputRef}
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  onBlur={addEmail}
                  placeholder="Add email addresses..."
                  className="flex-1 min-w-[200px] bg-transparent border-0 text-red-100 placeholder:text-red-200/40 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-2"
                />
              </div>
            </div>

            {/* GPT Toggle */}
            <div className="border-t border-red-900/50 bg-[#0a0404] px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-red-300" />
                  <span className="text-sm text-red-100">Include GPT in conversation</span>
                </div>
                <Checkbox
                  id="include-gpt"
                  checked={includeGPT}
                  onCheckedChange={(checked) => setIncludeGPT(checked as boolean)}
                  className="border-red-700 data-[state=checked]:bg-red-600"
                />
              </div>
            </div>
          </div>

          {/* Message Input Area */}
          <div className="relative p-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your first message to start the chat..."
              className="min-h-[80px] bg-transparent border-0 text-red-50 placeholder:text-red-200/40 pl-12 pr-12 py-3 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              required
              disabled={isSubmitting}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              size="icon"
              disabled={isSubmitting || !message.trim()}
              className="absolute right-6 bottom-6 rounded-lg h-10 w-10 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>

            {/* Plus Button */}
            <div className="absolute left-6 bottom-6 flex items-center justify-center rounded-lg border border-red-800/50 h-8 w-8 bg-red-950/50">
              <Plus className="h-4 w-4 text-red-300" />
            </div>
          </div>
        </form>

        {/* Helper Text */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          {emails.length} recipient{emails.length !== 1 ? 's' : ''} 
          {includeGPT && ' • GPT enabled'}
          {emails.length > 0 && ' • Press Enter or comma to add emails'}
        </p>
      </div>
    </div>
  );
}
