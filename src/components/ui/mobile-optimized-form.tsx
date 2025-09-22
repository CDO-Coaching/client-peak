import { ReactNode, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button, ButtonProps } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Mobile-optimized Input with larger touch targets
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          'min-h-[48px] text-base rounded-xl border-2 focus:border-primary/50 touch-manipulation',
          className
        )}
        {...props}
      />
    );
  }
);

MobileInput.displayName = 'MobileInput';

// Mobile-optimized Textarea
interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn(
          'min-h-[120px] text-base rounded-xl border-2 focus:border-primary/50 touch-manipulation resize-none',
          className
        )}
        {...props}
      />
    );
  }
);

MobileTextarea.displayName = 'MobileTextarea';

// Mobile-optimized Button
interface MobileButtonProps extends ButtonProps {
  touchSize?: 'default' | 'large';
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, touchSize = 'default', children, ...props }, ref) => {
    const sizeClasses = {
      default: 'min-h-[48px] px-6 py-3 text-base',
      large: 'min-h-[56px] px-8 py-4 text-lg',
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'touch-manipulation transition-transform active:scale-95 rounded-xl font-semibold',
          sizeClasses[touchSize],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

MobileButton.displayName = 'MobileButton';

// Mobile-optimized Label
interface MobileLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  className?: string;
}

export const MobileLabel = forwardRef<HTMLLabelElement, MobileLabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Label
        ref={ref}
        className={cn('text-base font-semibold mb-2 block', className)}
        {...props}
      >
        {children}
      </Label>
    );
  }
);

MobileLabel.displayName = 'MobileLabel';

// Mobile Form Container
interface MobileFormContainerProps {
  children: ReactNode;
  className?: string;
}

export const MobileFormContainer = ({ children, className }: MobileFormContainerProps) => {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
};

// Mobile Form Field
interface MobileFormFieldProps {
  children: ReactNode;
  className?: string;
}

export const MobileFormField = ({ children, className }: MobileFormFieldProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  );
};