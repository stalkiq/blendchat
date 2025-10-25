'use client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ArrowUp, Bot, Plus, UserCircle2, Mail, Copy, Check } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useUser } from '../user-context';

interface Message {
  id: string;
  text: string;
  createdAt: string;
  sender: 'user' | 'ai';
  senderEmail?: string;
  senderName?: string;
}

interface Chat {
  id: string;
  chatEmail?: string;
  title: string;
  createdAt: string;
  emails: string[];
  includeGPT: boolean;
  creatorEmail: string;
  creatorName: string;
  messages: Message[];
}

export default function ChatSessionPage() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const params = useParams();
  const chatId = params.id as string;
  const { user: currentUser } = useUser();

  const copyEmail = async () => {
    if (chat?.chatEmail) {
      await navigator.clipboard.writeText(chat.chatEmail);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  useEffect(() => {
    // Fetch chat from API with access token verification
    const fetchChat = async () => {
      try {
        // Get token and email from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        const url = new URL(`/api/chat/${chatId}`, window.location.origin);
        if (token) url.searchParams.set('token', token);
        if (email) url.searchParams.set('email', email);

        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          setChat(data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId]);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-red-300">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (notFound || !chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-black">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-300 mb-4">Chat Not Found</h2>
          <p className="text-red-200/70 mb-6">
            This chat may have expired or doesn't exist. Chat history is deleted when the page refreshes.
          </p>
          <Button
            onClick={() => router.push('/chat')}
            className="bg-red-600 hover:bg-red-700"
          >
            Start New Chat
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    const prompt = (formData.get('message') as string) || '';
    if (!prompt.trim()) return;

    // Optimistically add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: prompt,
      createdAt: new Date().toISOString(),
      sender: 'user',
      senderEmail: currentUser.email,
      senderName: currentUser.name,
    };

    setChat(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, userMessage],
      };
    });

    form.reset();

    // Send message to backend
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          senderEmail: currentUser.email,
          senderName: currentUser.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update chat with new message and AI response
        if (data.aiResponse) {
          setChat(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [...prev.messages, data.aiResponse],
            };
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-full flex-col bg-black">
      <header className="border-b border-red-900/50 px-6 py-4 shrink-0">
        <div className="mx-auto max-w-4xl w-full">
          {/* Chat Title and Info */}
          <div className="text-center">
            <h2 className="text-xl font-headline font-semibold tracking-tight text-red-100">
              {chat.title}
            </h2>
            <p className="text-xs text-red-300/60 mt-1">
              Private group chat • {chat.emails?.length || 0} invited
              {chat.includeGPT && ' • GPT enabled'}
            </p>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6 max-w-4xl mx-auto w-full">
          {chat.messages.map(message => (
            <div key={message.id} className="flex items-start gap-4">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-red-950/50 border border-red-800/50 flex items-center justify-center">
                {message.sender === 'ai' ? (
                  <Bot className="h-5 w-5 text-red-300" />
                ) : (
                  <UserCircle2 className="h-5 w-5 text-red-300" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-medium mb-1 text-red-200">
                  {message.sender === 'ai' ? 'GPT Assistant' : message.senderName || 'User'}
                </p>
                <p className="text-[0.95rem] leading-6 text-red-100/90 whitespace-pre-wrap">
                  {message.text || '...'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="px-4 pb-4">
        <div className="mx-auto max-w-4xl">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="relative rounded-2xl border-2 border-red-900 bg-[#1a0b0b] overflow-hidden"
          >
            <Textarea
              name="message"
              placeholder="Type your message..."
              className="min-h-[56px] bg-transparent border-0 text-red-50 placeholder:text-red-200/40 pl-12 pr-12 py-3 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              required
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-red-600 hover:bg-red-700"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg border border-red-800/50 h-8 w-8 bg-red-950/50">
              <Plus className="h-5 w-5 text-red-300" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
