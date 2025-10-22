'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Check } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect to chat if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log('User authenticated, redirecting to chat...', user);
      setIsRedirecting(true);
      router.push('/chat');
    }
  }, [user, loading, router]);

  const handleStartNow = async () => {
    if (user) {
      router.push('/chat');
    } else if (!loading) {
      console.log('Starting Google sign-in...');
      await signInWithGoogle();
    }
  };

  // Show loading state during redirect
  if (isRedirecting || (user && !loading)) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to chat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-16 text-center">
          <div className="flex items-center justify-center">
            <Logo />
          </div>
          <h1 className="mt-6 text-5xl font-headline font-extrabold tracking-tight">
            The AI for Groups
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            BlendChat lets teams collaborate with AI together—share context, co-create, and
            get answers that reflect everyone's inputs.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <Button 
              size="lg" 
              className="rounded-xl bg-[#1a237e] hover:bg-[#0d1642] text-white font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
              onClick={handleStartNow}
              disabled={loading}
            >
              {loading ? (
                'Loading...'
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </Button>
            <Link href="/pricing">
              <Button size="lg" variant="secondary" className="rounded-xl">See pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-headline font-semibold tracking-tight">How it works</h2>
          <p className="mt-2 text-muted-foreground">
            Create a room, invite teammates, drop in your notes or links, and chat with an AI that
            sees the shared context. Every reply is shaped by the full conversation.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
            <h3 className="text-lg font-medium">1. Start a room</h3>
            <p className="mt-2 text-sm text-muted-foreground">Spin up a chat and invite collaborators.</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>Group participants</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>Shared history</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
            <h3 className="text-lg font-medium">2. Add context</h3>
            <p className="mt-2 text-sm text-muted-foreground">Paste notes, bullet points, or links so AI can reason.</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>Long‑form prompts</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>Multi‑user inputs</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
            <h3 className="text-lg font-medium">3. Decide together</h3>
            <p className="mt-2 text-sm text-muted-foreground">AI proposes drafts and options; your team iterates in one place.</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>Actionable outputs</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary"/>Consistent memory</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
