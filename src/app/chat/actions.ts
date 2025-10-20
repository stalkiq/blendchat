'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { chats, users } from '@/lib/data';
import type { Message, User } from '@/lib/types';

export async function createNewChat(formData: FormData) {
  const messageText = formData.get('message') as string;
  const userId = formData.get('userId') as string;
  const participantIds = formData.getAll('participantIds') as string[];

  if (!messageText || !userId) return;

  const currentUser = users.find(u => u.id === userId);
  if (!currentUser) return;

  const participants: User[] = [currentUser];
  participantIds.forEach(id => {
    if (id !== currentUser.id) {
      const user = users.find(u => u.id === id);
      if (user) {
        participants.push(user);
      }
    }
  });
  
  const uniqueParticipants = Array.from(new Set(participants.map(u => u.id))).map(id => {
    return participants.find(u => u.id === id)!;
  });


  // In a real app, you would create a new chat in the database.
  const newChatId = `chat-${Date.now()}`;
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    text: messageText,
    createdAt: new Date().toISOString(),
    sender: 'user',
    user: currentUser,
  };

  const newChat = {
    id: newChatId,
    title: messageText.substring(0, 30) + '...',
    createdAt: new Date().toISOString(),
    users: uniqueParticipants,
    messages: [newMessage],
  };

  // Call AWS chat API for first assistant reply
  try {
    const apiUrl = process.env.CHAT_API_URL;
    if (apiUrl) {
      const reply = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'You are a helpful assistant for a group chat.',
          history: [],
          prompt: messageText,
        }),
      }).then(r => r.json());

      if (reply?.reply) {
        newChat.messages.push({
          id: `msg-${Date.now()+1}`,
          text: reply.reply,
          createdAt: new Date().toISOString(),
          sender: 'ai',
        });
      }
    }
  } catch (e) {
    // Swallow API errors and proceed with empty AI message for demo
  }

  chats.unshift(newChat); // Add to the beginning of the array for demo

  revalidatePath('/chat');
  redirect(`/chat/${newChatId}`);
}

export async function sendMessage(formData: FormData) {
  const message = formData.get('message') as string;
  const chatId = formData.get('chatId') as string;
  const userId = formData.get('userId') as string;


  if (!message || !chatId || !userId) {
    return;
  }
  
  const currentUser = users.find(u => u.id === userId);
  if (!currentUser) return;


  // This is where you would:
  // 1. Get the current user
  // 2. Save the user's message to the database for this chatId
  // 3. Call the AI with the full chat history via AWS API
  console.log(`New message for chat ${chatId}: ${message}`);

  const chat = chats.find(c => c.id === chatId);
  if (chat) {
    chat.messages.push({
      id: `msg-${Date.now()}`,
      text: message,
      createdAt: new Date().toISOString(),
      sender: 'user',
      user: currentUser,
    });
    try {
      const apiUrl = process.env.CHAT_API_URL;
      if (apiUrl) {
        const history = chat.messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));
        const reply = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: 'You are a helpful assistant for a group chat.',
            history,
            prompt: message,
          }),
        }).then(r => r.json());
        chat.messages.push({
          id: `msg-${Date.now()+1}`,
          text: reply?.reply ?? ``,
          createdAt: new Date().toISOString(),
          sender: 'ai',
        });
      } else {
        chat.messages.push({
          id: `msg-${Date.now()+1}`,
          text: `AI backend not configured. Set CHAT_API_URL.`,
          createdAt: new Date().toISOString(),
          sender: 'ai',
        });
      }
    } catch {}
  }


  // For the demo, we'll just revalidate the path to show "new" (mocked) data.
  // In a real scenario, this would trigger a UI update with the new messages.
  revalidatePath(`/chat/${chatId}`);
}
