import React, { useState } from 'react';
import { SidebarNav } from '@/components/organisms/SidebarNav/SidebarNav';
import { TopHeader } from '@/components/organisms/TopHeader/TopHeader';
import { PrivacyModal } from '@/components/molecules/PrivacyModal/PrivacyModal';
import { cn } from '@/lib/utils';

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export interface DashboardLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  title?: string;
  onOpenAuth?: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPath,
  onNavigate,
  title = 'Dashboard',
  onOpenAuth,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-content-primary flex flex-col justify-between">
      <div className="flex flex-1">
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
            onOpenAuth={onOpenAuth}
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

          {/* Technical Authentic Footer (Anti-AI Slop Regla 1.1) */}
          {currentPath !== 'playground' && (
            <footer className="mt-auto border-t border-border-subtle/40 py-5 px-8 max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-content-muted">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                <span>Qurio • PostgreSQL 16 Sandbox</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Aprende SQL. Piensa en queries.</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPrivacyModalOpen(true)}
                  className="hover:text-content-primary transition-colors hover:underline"
                >
                  Privacidad & Términos
                </button>
                <a
                  href="https://github.com/ErickKNT/qurio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-accent transition-colors flex items-center gap-1.5"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              </div>
            </footer>
          )}
        </div>
      </div>

      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
};

