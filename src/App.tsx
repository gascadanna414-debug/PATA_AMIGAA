import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './components/HomeView';
import { AdoptionsView } from './components/AdoptionsView';
import { ReportView } from './components/ReportView';
import { EventsView } from './components/EventsView';
import { ChatView } from './components/ChatView';
import { ContactView } from './components/ContactView';
import { Footer } from './components/Footer';
import { User } from './types';
import { AuthController } from './controllers/authController';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthController.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [targetChatRescuer, setTargetChatRescuer] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(AuthController.getCurrentUser());
    };

    window.addEventListener('auth-state-change', handleAuthChange);
    return () => window.removeEventListener('auth-state-change', handleAuthChange);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToChat = (rescuerName?: string) => {
    setTargetChatRescuer(rescuerName);
    setActiveTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateToTab}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'inicio' && (
          <HomeView
            onNavigate={handleNavigateToTab}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'historias' && (
          <HomeView
            onNavigate={handleNavigateToTab}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'adopcion' && (
          <AdoptionsView
            onNavigateToChat={handleNavigateToChat}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'reportar' && (
          <ReportView
            currentUser={currentUser}
            onNavigateToChat={() => handleNavigateToTab('chat')}
          />
        )}

        {activeTab === 'eventos' && (
          <EventsView
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            initialChannelId={targetChatRescuer ? 'channel-veterinarias' : undefined}
          />
        )}

        {activeTab === 'contacto' && (
          <ContactView
            currentUser={currentUser}
            onNavigateToTab={handleNavigateToTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigateToTab} onOpenAuth={handleOpenAuth} />

      {/* Auth Modal (Login / Register / Recover Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          setCurrentUser(AuthController.getCurrentUser());
        }}
      />
    </div>
  );
}
