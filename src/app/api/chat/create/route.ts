import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createChat } from '@/lib/db';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { analyzeSentiment } from '@/lib/ai-enhanced';

const ses = new SESClient({ region: 'us-east-1' });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails, message, includeGPT, creatorEmail, creatorName } = body;

    // Create access tokens for each invited email (including creator)
    const accessTokens: Record<string, string> = {};
    const allParticipantEmails = [creatorEmail, ...(emails || [])];
    
    allParticipantEmails.forEach(email => {
      accessTokens[email] = nanoid(32);
    });
    
    // Analyze sentiment of first message
    const sentiment = await analyzeSentiment(message);
    
    // Create initial message
    const firstMessage = {
      id: nanoid(),
      text: message,
      createdAt: new Date().toISOString(),
      sender: 'user' as const,
      senderEmail: creatorEmail,
      senderName: creatorName,
      aiMetadata: {
        sentiment,
      },
    };
    
    // Create chat in DynamoDB
    const chat = await createChat({
      title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      invitedEmails: allParticipantEmails,
      accessTokens,
      includeGPT,
      creatorEmail,
      creatorName,
      messages: [firstMessage],
      participantCount: allParticipantEmails.length,
      tags: ['new'],
    });

    // Generate invitation links
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chatbudi.com';
    
    // Send email invitations to all participants (except creator)
    const inviteEmails = emails || [];
    const emailPromises = inviteEmails.map(async (recipientEmail: string) => {
      const token = accessTokens[recipientEmail];
      const inviteUrl = `${siteUrl}/chat/${chat.id}?token=${token}&email=${encodeURIComponent(recipientEmail)}`;
      
      const emailParams = {
        Source: 'BlendChat <noreply@chatbudi.com>',
        Destination: {
          ToAddresses: [recipientEmail],
        },
        Message: {
          Subject: {
            Data: `${creatorName} invited you to a group chat`,
          },
          Body: {
            Html: {
              Data: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
                    .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #7f1d1d; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
                    .message { background: #fef2f2; border-left: 4px solid #7f1d1d; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1 style="margin: 0; font-size: 24px;">🎉 You're invited to a group chat!</h1>
                    </div>
                    <div class="content">
                      <p><strong>${creatorName}</strong> (${creatorEmail}) has invited you to join a private group chat.</p>
                      
                      <div class="message">
                        <strong>First message:</strong>
                        <p style="margin: 10px 0 0 0;">"${message}"</p>
                      </div>
                      
                      <p>Click the button below to join the conversation:</p>
                      
                      <a href="${inviteUrl}" class="button">Join Group Chat</a>
                      
                      <p style="font-size: 14px; color: #666;">
                        <strong>🎯 What makes this special:</strong><br>
                        • Private & secure - only invited members<br>
                        ${includeGPT ? '• AI assistant provides summaries & action items<br>' : ''}
                        • Real-time collaboration<br>
                        • Email integration - reply via email
                      </p>
                      
                      <p style="font-size: 12px; color: #999; margin-top: 30px;">
                        If the button doesn't work, copy this link:<br>
                        <code style="background: #f5f5f5; padding: 5px; display: inline-block; margin-top: 5px; word-break: break-all;">${inviteUrl}</code>
                      </p>
                    </div>
                    <div class="footer">
                      <p>This invitation was sent by ${creatorName} via BlendChat</p>
                    </div>
                  </div>
                </body>
                </html>
              `,
            },
            Text: {
              Data: `
${creatorName} invited you to a group chat!

First message: "${message}"

Join the conversation by clicking this link:
${inviteUrl}

This is a private chat. Only invited members can participate.
${includeGPT ? 'GPT AI assistant is included in this chat.' : ''}

---
This invitation was sent by ${creatorName} (${creatorEmail}) via BlendChat
              `.trim(),
            },
          },
        },
      };

      try {
        await ses.send(new SendEmailCommand(emailParams));
        console.log(`✅ Invite sent to ${recipientEmail}`);
      } catch (error) {
        console.error(`❌ Failed to send invite to ${recipientEmail}:`, error);
      }
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    // Generate creator's access URL
    const creatorToken = accessTokens[creatorEmail];
    const creatorUrl = `${siteUrl}/chat/${chat.id}?token=${creatorToken}&email=${encodeURIComponent(creatorEmail)}`;

    console.log('=== 🚀 BLENDCHAT CREATED ===');
    console.log(`Chat ID: ${chat.id}`);
    console.log(`Creator: ${creatorName} (${creatorEmail})`);
    console.log(`Invited: ${inviteEmails.join(', ')}`);
    console.log(`Invites sent: ${inviteEmails.length}`);
    console.log(`AI-Enhanced: ${includeGPT ? 'YES' : 'NO'}`);
    console.log(`Sentiment: ${sentiment}`);
    console.log('================================');

    return NextResponse.json({ 
      chatId: chat.id,
      chatUrl: creatorUrl,
      invitesSent: inviteEmails.length,
      success: true,
      message: 'AI-enhanced private chat created! 🎉',
      features: {
        aiInsights: includeGPT,
        realTimeSync: true,
        emailIntegration: true,
        persistentStorage: true,
      }
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

