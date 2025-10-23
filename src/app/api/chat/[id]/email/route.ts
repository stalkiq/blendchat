import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { chats } from '@/lib/chat-storage';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify Lambda secret key
    const lambdaKey = request.headers.get('X-Lambda-Key');
    if (lambdaKey !== process.env.LAMBDA_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const chatId = params.id;
    const body = await request.json();
    const { senderEmail, senderName, message } = body;

    const chat = chats.get(chatId);
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or expired' },
        { status: 404 }
      );
    }

    // Add message from email to chat
    const newMessage = {
      id: nanoid(),
      text: message,
      createdAt: new Date().toISOString(),
      sender: 'user',
      senderEmail,
      senderName,
      source: 'email',
    };

    chat.messages.push(newMessage);
    chats.set(chatId, chat);

    console.log(`Email message added to chat ${chatId} from ${senderEmail}`);

    // If GPT is enabled, trigger AI response
    if (chat.includeGPT) {
      // Add AI response logic here
      // For now, just acknowledge
      console.log('GPT response would be triggered here');
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error adding email message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

