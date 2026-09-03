import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import { HomeView } from './components/HomeView';
import { AdoptionsView } from './components/AdoptionsView';
import { ReportView } from './components/ReportView';
import { EventsView } from './components/EventsView';
import { BlogView } from './components/BlogView';
import { ChatView } from './components/ChatView';
import { ContactView } from './components/ContactView';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { User } from './types';
import { AuthController } from './controllers/authController';
import { MessageCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthController.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [targetChatRescuer, setTargetChatRescuer] = useState<string | undefined>(undefined);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('story-chopper');
  const [petInitialSpeciesFilter, setPetInitialSpeciesFilter] = useState<'Todos' | 'Perro' | 'Gato'>('Todos');

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

  const handleNavigateToTab = (
    tab: string, 
    storyId?: string, 
    petFilter?: 'Perro' | 'Gato' | 'Todos'
  ) => {
    if (storyId) {
      setSelectedStoryId(storyId);
    }
    if (petFilter) {
      setPetInitialSpeciesFilter(petFilter);
    } else {
      setPetInitialSpeciesFilter('Todos');
    }

    if (tab === 'admin') {
      if (!currentUser) {
        handleOpenAuth('login');
        return;
      }
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToChat = (rescuerName?: string) => {
    setTargetChatRescuer(rescuerName);
    setActiveTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C1E14] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* Top Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateToTab}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
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

        {activeTab === 'adopcion' && (
          <AdoptionsView
            onNavigateToChat={handleNavigateToChat}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            initialSpeciesFilter={petInitialSpeciesFilter}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {activeTab === 'blog' && (
          <BlogView
            initialStoryId={selectedStoryId}
            currentUser={currentUser}
            onNavigateToAdopt={() => handleNavigateToTab('adopcion')}
          />
        )}

        {activeTab === 'historias' && (
          <BlogView
            initialStoryId={selectedStoryId}
            currentUser={currentUser}
            onNavigateToAdopt={() => handleNavigateToTab('adopcion')}
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

        {activeTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {activeTab === 'contacto' && (
          <ContactView
            currentUser={currentUser}
            onNavigateToTab={handleNavigateToTab}
          />
        )}
      </main>

      {/* Floating Action Button for WhatsApp / Direct Helpline */}
      <aside aria-label="Ayuda rápida WhatsApp" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
        <span className="hidden sm:inline-block bg-[#2C1E14] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          ¿Dudas o rescates? Escríbenos
        </span>
        <a
          href="https://wa.me/573128904521?text=Hola%20Pata%20Amiga,%20me%20comunico%20desde%20la%20plataforma%20en%20Purificaci%C3%B3n."
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 cursor-pointer"
          title="Contactar por WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </aside>

      {/* Footer */}
      <Footer onNavigate={handleNavigateToTab} onOpenAuth={handleOpenAuth} />

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        currentUser={currentUser}
        onNavigateToTab={handleNavigateToTab}
      />

      {/* Auth Modal (Login / Register / Recover Password) */}
      <AuthModal
        key={`auth-modal-${authMode}-${isAuthModalOpen}`}
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
