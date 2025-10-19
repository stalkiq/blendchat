'use server';

import { setAuthCookie, clearAuthCookie } from '@/lib/auth';
import { users } from '@/lib/data';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: 'Invalid input.' };
  }

  const { email } = parsed.data;
  const user = users.find(u => u.email === email);

  if (!user) {
    return { error: 'User not found. Try signing up.' };
  }
  
  // In a real app, you'd verify the password here.
  // For this demo, we'll just log in the found user.
  await setAuthCookie(user.id);
  
  redirect('/chat');
}

export async function signup(formData: FormData) {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        return { error: 'Invalid input.' };
    }

    const { email } = parsed.data;
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        return { error: 'User already exists. Try logging in.' };
    }

    // In a real app, you would create a new user in the database.
    // For this demo, we'll use the first user as the newly "signed up" user.
    const newUser = users[0];
    await setAuthCookie(newUser.id);
    
    redirect('/chat');
}


export async function logout() {
  await clearAuthCookie();
  redirect('/login');
}
