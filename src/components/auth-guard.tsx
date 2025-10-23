'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithGoogle } = useAuth();

  // Automatically trigger sign-in for unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      signInWithGoogle();
    }
  }, [user, loading, signInWithGoogle]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

