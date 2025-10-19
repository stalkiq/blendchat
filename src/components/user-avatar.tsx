import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  user?: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={cn('h-8 w-8', className)}>
      <AvatarImage src={user?.avatarUrl} alt={user?.name} />
      <AvatarFallback>
        {user ? (
          user.name.charAt(0)
        ) : (
          <UserIcon className="h-4 w-4" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
