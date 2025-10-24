import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'BlendChatTable';

export interface Message {
  id: string;
  text: string;
  createdAt: string;
  sender: 'user' | 'ai' | 'email';
  senderEmail?: string;
  senderName?: string;
  aiMetadata?: {
    sentiment?: 'positive' | 'negative' | 'neutral';
    actionItems?: string[];
    summary?: string;
  };
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  invitedEmails: string[];
  accessTokens: Record<string, string>;
  includeGPT: boolean;
  creatorEmail: string;
  creatorName: string;
  messages: Message[];
  aiSummary?: string;
  actionItems?: Array<{ text: string; completed: boolean; assignedTo?: string }>;
  tags?: string[];
  participantCount?: number;
}

/**
 * Create a new chat
 */
export async function createChat(chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chat> {
  const chatId = nanoid(10);
  const now = new Date().toISOString();
  
  const newChat: Chat = {
    ...chat,
    id: chatId,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      pk: `CHAT#${chatId}`,
      sk: `METADATA`,
      ...newChat,
      type: 'chat',
      gsi1pk: `USER#${chat.creatorEmail}`,
      gsi1sk: now,
    },
  }));

  return newChat;
}

/**
 * Get chat by ID with access verification
 */
export async function getChat(chatId: string, email?: string, token?: string): Promise<Chat | null> {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `CHAT#${chatId}`,
      sk: `METADATA`,
    },
  }));

  if (!result.Item) {
    return null;
  }

  const chat = result.Item as Chat;

  // Verify access if tokens are required
  if (chat.accessTokens && email && token) {
    const expectedToken = chat.accessTokens[email];
    if (!expectedToken || expectedToken !== token) {
      throw new Error('Unauthorized');
    }
  } else if (chat.accessTokens && (!email || !token)) {
    throw new Error('Unauthorized');
  }

  return chat;
}

/**
 * Add a message to a chat
 */
export async function addMessage(chatId: string, message: Omit<Message, 'id'>): Promise<Message> {
  const messageId = nanoid();
  const newMessage: Message = {
    ...message,
    id: messageId,
  };

  // Update the chat's messages array
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `CHAT#${chatId}`,
      sk: `METADATA`,
    },
    UpdateExpression: 'SET messages = list_append(if_not_exists(messages, :empty_list), :new_message), updatedAt = :now',
    ExpressionAttributeValues: {
      ':new_message': [newMessage],
      ':empty_list': [],
      ':now': new Date().toISOString(),
    },
  }));

  return newMessage;
}

/**
 * Update chat with AI insights (summary, action items)
 */
export async function updateChatAIInsights(
  chatId: string, 
  insights: { aiSummary?: string; actionItems?: Chat['actionItems'] }
): Promise<void> {
  const updateExpressions: string[] = ['updatedAt = :now'];
  const expressionAttributeValues: Record<string, any> = {
    ':now': new Date().toISOString(),
  };

  if (insights.aiSummary) {
    updateExpressions.push('aiSummary = :summary');
    expressionAttributeValues[':summary'] = insights.aiSummary;
  }

  if (insights.actionItems) {
    updateExpressions.push('actionItems = :items');
    expressionAttributeValues[':items'] = insights.actionItems;
  }

  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `CHAT#${chatId}`,
      sk: `METADATA`,
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
  }));
}

/**
 * Get all chats for a user
 */
export async function getUserChats(email: string): Promise<Chat[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'gsi1',
    KeyConditionExpression: 'gsi1pk = :pk',
    ExpressionAttributeValues: {
      ':pk': `USER#${email}`,
    },
    ScanIndexForward: false, // Most recent first
  }));

  return (result.Items || []) as Chat[];
}

/**
 * Search chats by keyword
 */
export async function searchChats(keyword: string, email: string): Promise<Chat[]> {
  // Get user's chats first
  const userChats = await getUserChats(email);
  
  // Filter by keyword in title or messages
  return userChats.filter(chat => 
    chat.title.toLowerCase().includes(keyword.toLowerCase()) ||
    chat.messages.some(m => m.text.toLowerCase().includes(keyword.toLowerCase()))
  );
}

