import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { MobileBottomNav } from '../ui/mobile-bottom-nav';

interface MobileLayoutProps {
  children: ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Navigation />
      <main className="pb-20 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
};