import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getAuthUser();
  if (user) {
    redirect('/chat');
  } else {
    redirect('/login');
  }
}
