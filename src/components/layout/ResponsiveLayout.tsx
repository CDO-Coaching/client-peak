import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { MobileBottomNav } from '../ui/mobile-bottom-nav';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const isMobile = window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Navigation />
      <main className={`${isMobile ? 'pb-20' : 'pb-0'}`}>
        {children}
      </main>
      {isMobile && <MobileBottomNav />}
    </div>
  );
};