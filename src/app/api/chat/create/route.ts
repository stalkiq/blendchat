import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { chats } from '@/lib/chat-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails, message, includeGPT, creatorEmail, creatorName } = body;

    // Generate unique chat ID
    const chatId = nanoid(10);
    
    // Generate unique email address for this chat
    const chatEmail = `chat-${chatId}@chatbudi.com`;
    
    // Create chat object
    const chat = {
      id: chatId,
      chatEmail,
      title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      createdAt: new Date().toISOString(),
      emails: emails || [],
      includeGPT,
      creatorEmail,
      creatorName,
      messages: [
        {
          id: nanoid(),
          text: message,
          createdAt: new Date().toISOString(),
          sender: 'user',
          senderEmail: creatorEmail,
          senderName: creatorName,
        },
      ],
    };

    // Store chat in memory
    chats.set(chatId, chat);

    // Generate invitation link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chatbudi.com';
    const chatUrl = `${siteUrl}/chat/${chatId}`;

    // Log chat creation info
    console.log('=== CHAT CREATED ===');
    console.log(`Chat ID: ${chatId}`);
    console.log(`Chat Email: ${chatEmail}`);
    console.log(`Link: ${chatUrl}`);
    console.log(`Recipients: ${emails.join(', ')}`);
    console.log(`Creator: ${creatorName} (${creatorEmail})`);
    console.log('====================');

    return NextResponse.json({ 
      chatId,
      chatEmail,
      chatUrl,
      success: true,
      message: 'Chat created successfully' 
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

