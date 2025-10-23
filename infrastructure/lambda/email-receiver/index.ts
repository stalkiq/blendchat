import { SESEvent } from 'aws-lambda';
import { simpleParser, ParsedMail } from 'mailparser';

// API endpoint to add message to chat
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://chatbudi.com';

export const handler = async (event: SESEvent) => {
  console.log('Received SES event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const sesMessage = record.ses.mail;
      const receipt = record.ses.receipt;

      // Extract the email content
      const emailContent = sesMessage.content;
      
      // Parse the email
      const parsed: ParsedMail = await simpleParser(emailContent);

      // Extract chat ID from recipient email
      // Format: chat-{chatId}@chatbudi.com
      const recipient = receipt.recipients[0];
      const chatIdMatch = recipient.match(/^chat-([a-zA-Z0-9_-]+)@/);
      
      if (!chatIdMatch) {
        console.log('Invalid recipient format:', recipient);
        continue;
      }

      const chatId = chatIdMatch[1];
      const senderEmail = parsed.from?.value[0]?.address || 'unknown@example.com';
      const senderName = parsed.from?.value[0]?.name || senderEmail.split('@')[0];
      const messageText = parsed.text || parsed.html?.replace(/<[^>]*>/g, '') || '';
      const subject = parsed.subject || '';

      // Prepare message
      const messageBody = subject ? `Subject: ${subject}\n\n${messageText}` : messageText;

      console.log('Processing email:', {
        chatId,
        senderEmail,
        senderName,
        subject,
        messageLength: messageBody.length,
      });

      // Call API to add message to chat
      const response = await fetch(`${API_ENDPOINT}/api/chat/${chatId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Lambda-Key': process.env.LAMBDA_SECRET_KEY || '',
        },
        body: JSON.stringify({
          senderEmail,
          senderName,
          message: messageBody.trim(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to add message:', await response.text());
      } else {
        console.log('Message added successfully');
      }
    } catch (error) {
      console.error('Error processing email:', error);
    }
  }

  return { disposition: 'STOP_RULE' };
};

