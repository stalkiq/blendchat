'use client';

import { User } from '@/lib/types';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

interface UserContextType {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Default user - no authentication required
const defaultUser: User = {
  id: '1',
  name: 'Guest User',
  email: 'guest@chatbudi.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);

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
