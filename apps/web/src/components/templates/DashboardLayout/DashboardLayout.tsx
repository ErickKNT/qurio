import React, { useState } from 'react';
import { SidebarNav } from '@/components/organisms/SidebarNav/SidebarNav';
import { TopHeader } from '@/components/organisms/TopHeader/TopHeader';
import { cn } from '@/lib/utils';

export interface DashboardLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  title?: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPath,
  onNavigate,
  title = 'Dashboard',
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-content-primary flex">
      {/* Sidebar Navigation */}
      <SidebarNav
        currentPath={currentPath}
        onNavigate={onNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        )}
      >
        <TopHeader
          title={title}
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenPlayground={() => onNavigate('playground')}
        />

        <main
          className={cn(
            'flex-1 transition-all duration-300 animate-fadeIn',
            currentPath === 'playground'
              ? 'pt-16 px-6 pb-3 w-full h-screen flex flex-col overflow-hidden max-w-none'
              : 'pt-20 px-8 pb-12 max-w-7xl w-full mx-auto'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
