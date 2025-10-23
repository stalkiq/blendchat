// In-memory storage for ephemeral chats
// This will be cleared when the server restarts (ephemeral by design)
export const chats = new Map<string, any>();

