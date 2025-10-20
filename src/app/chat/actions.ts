'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { chats, users } from '@/lib/data';
import type { Message } from '@/lib/types';

export async function createNewChat(formData: FormData) {
  const messageText = formData.get('message') as string;
  const userId = formData.get('userId') as string;

  if (!messageText || !userId) return;

  const currentUser = users.find(u => u.id === userId);
  if (!currentUser) return;


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
    users: [currentUser],
    messages: [newMessage],
  };

  // This is where you would get the AI response and add it to messages

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
  // 3. Call the AI with the full chat history
  // 4. Save the AI's response to the database
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
     chat.messages.push({
      id: `msg-${Date.now()+1}`,
      text: `This is a mock AI response to: "${message}"`,
      createdAt: new Date().toISOString(),
      sender: 'ai',
    });
  }


  // For the demo, we'll just revalidate the path to show "new" (mocked) data.
  // In a real scenario, this would trigger a UI update with the new messages.
  revalidatePath(`/chat/${chatId}`);
}
