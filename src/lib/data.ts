import type { User, Chat } from './types';

export const users: User[] = [
  {
    id: '1',
    name: 'Alex',
    avatarUrl: 'https://picsum.photos/seed/10/40/40',
    email: 'alex@example.com',
  },
  {
    id: '2',
    name: 'Sam',
    avatarUrl: 'https://picsum.photos/seed/11/40/40',
    email: 'sam@example.com',
  },
  {
    id: '3',
    name: 'Taylor',
    avatarUrl: 'https://picsum.photos/seed/12/40/40',
    email: 'taylor@example.com',
  },
];

export const chats: Chat[] = [
  {
    id: 'chat-1',
    title: 'Brainstorming Session',
    createdAt: '2024-07-29T10:00:00Z',
    users: [users[0], users[1]],
    messages: [
      {
        id: 'msg-1',
        text: 'What are some innovative ideas for sustainable urban living?',
        createdAt: '2024-07-29T10:00:15Z',
        sender: 'user',
        user: users[0],
      },
      {
        id: 'msg-2',
        text: 'That\'s a great question! Some ideas include vertical farming integrated into residential buildings, smart grids for energy distribution, and promoting electric micro-mobility solutions. We could also explore community-owned renewable energy projects.',
        createdAt: '2024-07-29T10:01:05Z',
        sender: 'ai',
      },
      {
        id: 'msg-3',
        text: 'I like the vertical farming idea. How could we make that economically viable for residents?',
        createdAt: '2024-07-29T10:02:30Z',
        sender: 'other',
        user: users[1],
      },
       {
        id: 'msg-4',
        text: 'To make vertical farming economically viable, we could implement a subscription model for fresh produce, create educational workshops to generate revenue, and seek government grants for green initiatives. Partnering with local restaurants could also provide a steady income stream.',
        createdAt: '2024-07-29T10:03:45Z',
        sender: 'ai',
      },
    ],
  },
  {
    id: 'chat-2',
    title: 'Planning a trip to Japan',
    createdAt: '2024-07-28T14:00:00Z',
    users: [users[0], users[2]],
    messages: [
      {
        id: 'msg-5',
        text: 'Hey everyone, I\'m planning a 2-week trip to Japan. Any must-see places for a first-timer?',
        createdAt: '2024-07-28T14:00:20Z',
        sender: 'user',
        user: users[0],
      },
      {
        id: 'msg-6',
        text: 'Definitely! For a first trip, I\'d recommend a classic route: Tokyo for the vibrant city life, Kyoto for traditional temples and gardens, and maybe a day trip to Hakone to see Mt. Fuji. Have you thought about getting a Japan Rail Pass?',
        createdAt: '2024-07-28T14:01:10Z',
        sender: 'ai',
      },
    ],
  },
];

export function getChat(id: string) {
  return chats.find(c => c.id === id);
}

export function getChats() {
    return chats;
}
