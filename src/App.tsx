import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider, useApp } from './context/AppContext';
import { Onboarding } from './components/Onboarding';
import { Discovery } from './components/Discovery';
import { Chat } from './components/Chat';
import { Profile } from './components/Profile';
import { ProfileView } from './components/ProfileView';
import { Admin } from './components/Admin';
import { BlockedUsers } from './components/BlockedUsers';
import { TopPicks } from './components/TopPicks';
import { WhoLikedYou } from './components/WhoLikedYou';
import { MatchOverlay } from './components/MatchOverlay';
import { MessageCircle, User, Zap } from 'lucide-react';
import { cn, getTelegramWebApp } from './lib/utils';
import { TelegramTheme } from './utils/telegram';

const Navigation: React.FC = () => {
  const { view, setView } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { id: 'discovery', icon: Zap, label: 'Discovery' },
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#0B0D14]/90 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-8 pb-6 z-40">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            const targetPath = item.id === 'discovery' ? '/' : `/${item.id}`;
            setView(item.id as any);
            navigate(targetPath);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 transition-all relative",
            view === item.id ? "text-[#FF8C00]" : "text-white/30"
          )}
        >
          <item.icon className={cn("w-7 h-7", view === item.id && "fill-current")} />
          <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          {view === item.id && (
            <div className="absolute -top-1 w-1 h-1 bg-[#FF8C00] rounded-full shadow-[0_0_8px_#FF8C00]" />
          )}
        </button>
      ))}
    </nav>
  );
};

const AppContent: React.FC = () => {
  const { view, user, setView } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.expand();
      tg.ready();
      tg.enableClosingConfirmation();
      tg.setHeaderColor('#0B0D14');
      tg.setBackgroundColor('#0B0D14');
      
      // Request Location for proximity sorting
      if (tg.LocationManager) {
        tg.LocationManager.init(() => {
          tg.LocationManager.getLocation((data: any) => {
            console.log('Location updated:', data);
          });
        });
      }
    }
  }, []);

  useEffect(() => {
    const path = location.pathname;
    const state = location.state as any;
    
    // Handle URL-based navigation
    if (path.startsWith('/profile/') || path === '/blocked' || path === '/admin') {
      return;
    }

    if (!user) {
      // Force onboarding when no user
      if (path !== '/' && path !== '') {
        navigate('/');
      }
      setView('onboarding');
      return;
    }

    // Map URL paths to views
    if (path === '/' || path === '' || path === '/discovery') {
      setView('discovery');
      // Clear any refreshDeck state to prevent infinite loops
      if (state?.refreshDeck) {
        // Trigger refresh event for Discovery component
        window.dispatchEvent(new CustomEvent('refreshDiscoveryDeck'));
        navigate('/', { replace: true, state: {} });
      }
    } else if (path === '/chats') {
      setView('chats');
    } else if (path === '/profile') {
      setView('profile');
    }
  }, [location.pathname, location.state, user, setView, navigate]);

  // Handle profile view routes
  if (location.pathname.startsWith('/profile/')) {
    return <ProfileView />;
  }

  if (location.pathname === '/blocked') {
    if (!user) {
      return <Onboarding />;
    }
    return <BlockedUsers />;
  }

  if (!user && view === 'onboarding') {
    return <Onboarding />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0B0D14] text-white">
      <main className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
        {view === 'discovery' && <Discovery />}
        {view === 'chats' && <Chat />}
        {view === 'profile' && <Profile />}
      </main>
      <Navigation />
      <MatchOverlay />
    </div>
  );
};

const App: React.FC = () => {
  // Initialize Telegram theme on app startup
  useEffect(() => {
    TelegramTheme.initialize();
  }, []);

  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/profile/:userId" element={<ProfileView />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/top-picks" element={<TopPicks />} />
          <Route path="/who-liked-you" element={<WhoLikedYou />} />
          <Route path="/blocked" element={<AppContent />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
        <Toaster
          position="top-center"
          theme="dark"
          expand={false}
          richColors
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              color: 'white',
            },
          }}
        />
      </AppProvider>
    </Router>
  );
};

export default App;