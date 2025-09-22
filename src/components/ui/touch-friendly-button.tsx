import { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchFriendlyButtonProps extends ButtonProps {
  touchSize?: 'default' | 'large' | 'xl';
}

export const TouchFriendlyButton = forwardRef<HTMLButtonElement, TouchFriendlyButtonProps>(
  ({ className, touchSize = 'default', ...props }, ref) => {
    const sizeClasses = {
      default: 'min-h-[44px] min-w-[44px] px-4 py-2',
      large: 'min-h-[48px] min-w-[48px] px-6 py-3 text-base',
      xl: 'min-h-[56px] min-w-[56px] px-8 py-4 text-lg',
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'touch-manipulation transition-transform active:scale-95',
          sizeClasses[touchSize],
          className
        )}
        {...props}
      />
    );
  }
);

TouchFriendlyButton.displayName = 'TouchFriendlyButton';