import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { CheckSquare } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export default function App() {
  const { user, loading } = useAuth();
  const [activeScreen, setActiveScreen] = useState<'home' | 'profile'>('home');
  const [hasOpenModal, setHasOpenModal] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapApp.addListener('backButton', ({ canGoBack }) => {
      // 1. Agar koi Bottom Sheet / Note Editor khula hai toh pehle use band karo
      if (hasOpenModal) {
        window.dispatchEvent(new CustomEvent('app:close-modal'));
        return;
      }

      // 2. Profile screen se Home screen par wapas jao
      if (activeScreen === 'profile') {
        setActiveScreen('home');
        return;
      }

      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });

    return () => {
      listener.then((handle) => handle.remove());
    };
  }, [activeScreen, hasOpenModal]);

  if (loading) {
    return (
      <div className="min-h-dvh w-full max-w-[480px] mx-auto bg-bg-primary flex flex-col items-center justify-center gap-3 px-6">
        <div className="w-12 h-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shadow-lg shadow-violet-600/25 animate-pulse">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full max-w-[480px] mx-auto bg-bg-primary text-text-primary flex flex-col relative shadow-sm">
      {!user ? (
        <AuthScreen />
      ) : activeScreen === 'profile' ? (
        <ProfileScreen onBack={() => setActiveScreen('home')} />
      ) : (
        <HomeScreen
          onOpenProfile={() => setActiveScreen('profile')}
          onModalStateChange={setHasOpenModal}
        />
      )}
    </div>
  );
}
