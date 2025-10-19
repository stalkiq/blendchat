export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
};

export type Message = {
  id: string;
  text: string;
  createdAt: string;
  sender: 'user' | 'ai' | 'other';
  user?: User;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  users: User[];
  createdAt: string;
};
