import { ReactNode, forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TouchFriendlyCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const TouchFriendlyCard = forwardRef<HTMLDivElement, TouchFriendlyCardProps>(
  ({ children, className, onClick, disabled, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'shadow-medium hover:shadow-lg transition-all duration-300 select-none',
          onClick && !disabled && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] touch-manipulation',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

TouchFriendlyCard.displayName = 'TouchFriendlyCard';

// Export re-usable card components for consistency
export { CardContent, CardDescription, CardHeader, CardTitle };