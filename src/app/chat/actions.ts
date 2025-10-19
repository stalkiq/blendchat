'use server';

import { revalidatePath } from 'next/cache';

export async function createNewChat() {
    // In a real app, you would create a new chat in the database.
    // For this demo, we'll just redirect to the base chat page.
    revalidatePath('/chat');
}

export async function sendMessage(formData: FormData) {
  const message = formData.get('message') as string;
  const chatId = formData.get('chatId') as string;

  if (!message || !chatId) {
    return;
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
