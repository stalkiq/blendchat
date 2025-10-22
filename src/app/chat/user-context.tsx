'use client';

import { User } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

interface UserContextType {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  
  // Convert authenticated user to app User type
  const [user, setUser] = useState<User>({
    id: authUser?.id || '1',
    name: authUser?.name || authUser?.email?.split('@')[0] || 'User',
    email: authUser?.email || '',
    avatar: authUser?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.email || 'user'}`,
  });

  // Update user when authUser changes
  useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser.id,
        name: authUser.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        avatar: authUser.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email}`,
      });
    }
  }, [authUser]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
