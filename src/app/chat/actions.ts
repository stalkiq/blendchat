'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { chats } from '@/lib/data';

export async function createNewChat(formData: FormData) {
    const message = formData.get('message') as string;
    
    // In a real app, you would create a new chat in the database.
    const newChatId = `chat-${Date.now()}`;
    const newChat = {
        id: newChatId,
        title: message.substring(0, 30) + '...',
        createdAt: new Date().toISOString(),
        users: [], // Add users as needed
        messages: [],
    };
    chats.unshift(newChat); // Add to the beginning of the array for demo
    
    revalidatePath('/chat');
    redirect(`/chat/${newChatId}`);
}

export async function sendMessage(formData: FormData) {
  const message = formData.get('message') as string;
  const chatId = formData.get('chatId') as string;

  if (!message) {
    return;
  }

  if (chatId === 'new-chat') {
    return createNewChat(formData);
  }

  // This is where you would:
  // 1. Get the current user
  // 2. Save the user's message to the database for this chatId
  // 3. Call the AI with the full chat history
  // 4. Save the AI's response to the database
  console.log(`New message for chat ${chatId}: ${message}`);

  // For the demo, we'll just revalidate the path to show "new" (mocked) data.
  // In a real scenario, this would trigger a UI update with the new messages.
  revalidatePath(`/chat/${chatId}`);
}
