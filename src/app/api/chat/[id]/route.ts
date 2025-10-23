import { NextRequest, NextResponse } from 'next/server';
import { chats } from '@/lib/chat-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const chatId = params.id;
  const chat = chats.get(chatId);

  if (!chat) {
    return NextResponse.json(
      { error: 'Chat not found or expired' },
      { status: 404 }
    );
  }

  return NextResponse.json(chat);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = params.id;
    const body = await request.json();
    const { message, senderEmail, senderName } = body;

    const chat = chats.get(chatId);
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or expired' },
        { status: 404 }
      );
    }

    // Add message to chat
    const newMessage = {
      id: `msg-${Date.now()}`,
      text: message,
      createdAt: new Date().toISOString(),
      sender: 'user',
      senderEmail,
      senderName,
    };

    chat.messages.push(newMessage);
    chats.set(chatId, chat);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

