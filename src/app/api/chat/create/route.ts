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

  // Import and initialize Resend
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Send emails to all recipients
    const results = await Promise.allSettled(
      emails.map(email =>
        resend.emails.send({
          from: 'BlendChat <onboarding@resend.dev>', // Using Resend's test domain
          to: email,
          subject: `${creatorName} invited you to a group chat`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                  .container { background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                  h1 { color: #7f1d1d; margin-top: 0; }
                  .message-box { background: #fef2f2; border-left: 4px solid #991b1b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                  .button { display: inline-block; background: #991b1b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                  .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🎉 You've been invited to a group chat!</h1>
                  <p><strong>${creatorName}</strong> (${creatorEmail}) invited you to join a conversation on BlendChat.</p>
                  
                  <div class="message-box">
                    <p style="margin: 0;"><strong>First message:</strong></p>
                    <p style="margin: 10px 0 0 0;">"${firstMessage.substring(0, 200)}${firstMessage.length > 200 ? '...' : ''}"</p>
                  </div>

                  <a href="${chatUrl}" class="button">Join the Conversation →</a>

                  <div class="footer">
                    <p>This is a temporary chat link. The conversation will be available until the server restarts.</p>
                    <p>BlendChat - The AI for Groups</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        })
      )
    );

    // Log results
    console.log('=== EMAIL INVITATIONS SENT ===');
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Sent to ${emails[index]} - ID: ${result.value.data?.id}`);
      } else {
        console.error(`❌ Failed to send to ${emails[index]}:`, result.reason);
      }
    });
    console.log('==============================');

    return true;
  } catch (error) {
    console.error('Error sending invitations:', error);
    return false;
  }
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

