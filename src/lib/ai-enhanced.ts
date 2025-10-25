/**
 * AI-Enhanced Communication Features
 * 
 * This module provides intelligent features that make BlendChat special:
 * - Automatic conversation summarization
 * - Action item extraction
 * - Sentiment analysis
 * - Smart reply suggestions
 * - Meeting schedule detection
 */

import { Message } from './db';

export interface AIInsights {
  summary: string;
  actionItems: Array<{ text: string; assignedTo?: string; completed: boolean }>;
  sentiment: 'positive' | 'negative' | 'neutral';
  keyTopics: string[];
  suggestedReplies: string[];
  detectedMeetings?: Array<{ date: string; time: string; topic: string }>;
}

/**
 * Analyze a conversation and extract insights
 */
export async function analyzeConversation(messages: Message[]): Promise<AIInsights> {
  const conversationText = messages
    .map(m => `${m.senderName || 'User'}: ${m.text}`)
    .join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes group conversations and provides actionable insights.
            
Your task is to analyze the conversation and return a JSON object with:
- summary: A concise 2-3 sentence summary of the conversation
- actionItems: Array of action items mentioned (with assignedTo if mentioned)
- sentiment: Overall sentiment (positive/negative/neutral)
- keyTopics: Array of main topics discussed (max 5)
- suggestedReplies: 3 contextually appropriate reply suggestions
- detectedMeetings: Any meetings mentioned with date/time/topic

Return ONLY valid JSON, no markdown formatting.`,
          },
          {
            role: 'user',
            content: conversationText,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    const insights = JSON.parse(content);
    
    return {
      summary: insights.summary || 'No summary available',
      actionItems: insights.actionItems || [],
      sentiment: insights.sentiment || 'neutral',
      keyTopics: insights.keyTopics || [],
      suggestedReplies: insights.suggestedReplies || [],
      detectedMeetings: insights.detectedMeetings,
    };
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    
    // Return fallback insights
    return {
      summary: 'Conversation in progress',
      actionItems: [],
      sentiment: 'neutral',
      keyTopics: [],
      suggestedReplies: ['Thanks for the update!', 'I agree, let\'s proceed.', 'Can you clarify?'],
    };
  }
}

/**
 * Generate a smart AI response based on context
 */
export async function generateSmartReply(
  messages: Message[],
  userPrompt: string
): Promise<string> {
  const context = messages
    .slice(-10) // Last 10 messages for context
    .map(m => `${m.senderName || 'User'}: ${m.text}`)
    .join('\n');

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not configured');
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Calling OpenAI API for smart reply...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant participating in a group chat. 
            
Your role is to:
- Provide helpful, concise responses
- Extract and summarize action items when asked
- Offer suggestions and insights
- Be professional but friendly
- When appropriate, format your response with bullet points or numbered lists

Keep responses focused and actionable.`,
          },
          {
            role: 'user',
            content: `Recent conversation:\n${context}\n\nNew message: ${userPrompt}\n\nProvide a helpful response:`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI reply:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return 'I apologize, but I\'m having trouble generating a response right now. Please try again.';
  }
}

/**
 * Analyze sentiment of a single message
 */
export async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  // Simple keyword-based sentiment analysis for now
  // In production, use a proper NLP service
  
  const positiveWords = ['great', 'awesome', 'excellent', 'thanks', 'love', 'perfect', 'wonderful', 'happy', 'good'];
  const negativeWords = ['bad', 'terrible', 'hate', 'problem', 'issue', 'wrong', 'error', 'fail', 'disappointing'];
  
  const lowerText = text.toLowerCase();
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Extract action items from text using AI
 */
export async function extractActionItems(text: string): Promise<string[]> {
  // Simple regex-based extraction
  const actionPatterns = [
    /(?:need to|should|must|have to|will|going to)\s+([^.!?]+)/gi,
    /action item[s]?:\s*([^.!?]+)/gi,
    /todo[s]?:\s*([^.!?]+)/gi,
  ];
  
  const items: string[] = [];
  
  for (const pattern of actionPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        items.push(match[1].trim());
      }
    }
  }
  
  return items;
}

