import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { useAuth } from './context/AuthContext';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import './App.css';

export default function App() {
  const { user, loading } = useAuth();
  const [activeScreen, setActiveScreen] = useState<'home' | 'profile'>('home');

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (activeScreen === 'profile') {
        setActiveScreen('home');
      } else if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });

    return () => {
      listener.then((handle) => handle.remove());
    };
  }, [activeScreen]);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="center-loader">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {!user ? (
        <AuthScreen />
      ) : activeScreen === 'profile' ? (
        <ProfileScreen onBack={() => setActiveScreen('home')} />
      ) : (
        <HomeScreen onOpenProfile={() => setActiveScreen('profile')} />
      )}
    </div>
  );
}
