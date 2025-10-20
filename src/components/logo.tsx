import { MessageSquareShare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold font-headline text-primary',
        className
      )}
    >
      <MessageSquareShare className="h-6 w-6" />
      <h1>BlendChat</h1>
    </div>
  );
}
