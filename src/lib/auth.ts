import 'server-only';
import { cookies } from 'next/headers';
import type { User } from './types';
import { users } from './data';

const SESSION_COOKIE_NAME = 'collective-chat-session';

export async function setAuthCookie(userId: string) {
  cookies().set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  const user = users.find(u => u.id === userId);
  return user || null;
}

export async function clearAuthCookie() {
  cookies().delete(SESSION_COOKIE_NAME);
}
