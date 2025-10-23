import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { chats } from '@/lib/chat-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails, message, includeGPT, creatorEmail, creatorName } = body;

    // Generate unique chat ID
    const chatId = nanoid(10);
    
    // Create chat object
    const chat = {
      id: chatId,
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

    // Send email invitations to all recipients
    if (emails.length > 0) {
      await sendInvitations(chatId, emails, message, creatorName, creatorEmail);
    }

    return NextResponse.json({ 
      chatId, 
      success: true,
      message: 'Chat created and invitations sent' 
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

async function sendInvitations(
  chatId: string,
  emails: string[],
  firstMessage: string,
  creatorName: string,
  creatorEmail: string
) {
  // Get the site URL from environment or construct it
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chatbudi.com';
  const chatUrl = `${siteUrl}/chat/${chatId}`;

  // For now, we'll log the emails that would be sent
  // You can integrate with Resend, SendGrid, AWS SES, etc.
  console.log('=== EMAIL INVITATIONS ===');
  emails.forEach(email => {
    console.log(`\nTO: ${email}`);
    console.log(`SUBJECT: ${creatorName} invited you to a group chat`);
    console.log(`BODY:`);
    console.log(`${creatorName} (${creatorEmail}) invited you to join a group chat.`);
    console.log(`\nFirst message: "${firstMessage.substring(0, 100)}${firstMessage.length > 100 ? '...' : ''}"`);
    console.log(`\nJoin the conversation: ${chatUrl}`);
    console.log(`\n========================`);
  });

  // TODO: Implement actual email sending
  // Example with Resend:
  /*
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await Promise.all(
    emails.map(email =>
      resend.emails.send({
        from: 'BlendChat <noreply@chatbudi.com>',
        to: email,
        subject: `${creatorName} invited you to a group chat`,
        html: `
          <h2>You've been invited to a group chat!</h2>
          <p>${creatorName} (${creatorEmail}) invited you to join a conversation.</p>
          <p><strong>First message:</strong> "${firstMessage.substring(0, 200)}..."</p>
          <p><a href="${chatUrl}">Join the conversation →</a></p>
        `,
      })
    )
  );
  */

  return true;
}

// Export function to get chat by ID
export function getChat(chatId: string) {
  return chats.get(chatId);
}

// Export function to add message to chat
export function addMessageToChat(chatId: string, message: any) {
  const chat = chats.get(chatId);
  if (chat) {
    chat.messages.push(message);
    chats.set(chatId, chat);
    return true;
  }
  return false;
}

