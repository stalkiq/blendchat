import { NextRequest, NextResponse } from 'next/server';
import { getChat } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = params.id;
    
    // Get access token from URL params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    // Get chat from DynamoDB with access verification
    const chat = await getChat(chatId, email || undefined, token || undefined);

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json(chat);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing access token' },
        { status: 403 }
      );
    }
    
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = params.id;
    const body = await request.json();
    const { message, senderEmail, senderName } = body;

    // Import the functions we need
    const { addMessage, getChat, updateChatAIInsights } = await import('@/lib/db');
    const { analyzeSentiment, analyzeConversation, generateSmartReply } = await import('@/lib/ai-enhanced');

    // Verify chat exists and get it
    const chat = await getChat(chatId);
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or expired' },
        { status: 404 }
      );
    }

    // Analyze sentiment of the message
    const sentiment = await analyzeSentiment(message);

    // Add message to chat
    const newMessage = await addMessage(chatId, {
      text: message,
      createdAt: new Date().toISOString(),
      sender: 'user',
      senderEmail,
      senderName,
      aiMetadata: {
        sentiment,
      },
    });

    // If AI is enabled, generate response and insights
    let aiResponse = null;
    if (chat.includeGPT) {
      // Generate AI response
      const aiReply = await generateSmartReply(chat.messages, message);
      
      aiResponse = await addMessage(chatId, {
        text: aiReply,
        createdAt: new Date().toISOString(),
        sender: 'ai',
        senderName: 'GPT Assistant',
      });

      // After several messages, analyze conversation and update insights
      if (chat.messages.length >= 5) {
        const insights = await analyzeConversation([...chat.messages, newMessage, aiResponse]);
        
        await updateChatAIInsights(chatId, {
          aiSummary: insights.summary,
          actionItems: insights.actionItems.map(item => ({
            text: item,
            completed: false,
          })),
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: newMessage,
      aiResponse,
    });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

