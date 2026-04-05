// Telegram WebApp Integration for React App
import { useState, useEffect } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  MainButton: {
    text: string;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
  };
  initDataUnsafe: {
    user?: TelegramUser;
  };
}

// Check if running in Telegram WebApp
export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && 
         (window as any).Telegram?.WebApp !== undefined;
};

// Get Telegram WebApp instance
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (isTelegramWebApp()) {
    return (window as any).Telegram.WebApp;
  }
  return null;
};

// Initialize Telegram WebApp
export const initTelegramWebApp = (): TelegramUser | null => {
  const tg = getTelegramWebApp();
  
  if (!tg) {
    return null;
  }
  
  // Initialize WebApp
  tg.ready();
  tg.expand();
  
  // Set theme colors
  tg.setHeaderColor('#667eea');
  tg.setBackgroundColor('#667eea');
  
  // Get user data
  const user = tg.initDataUnsafe?.user;
  
  if (user) {
    // Store user data in localStorage
    localStorage.setItem('telegramUser', JSON.stringify(user));
    return user;
  }
  
  return null;
};

// Listen for Telegram user data from iframe
export const listenForTelegramUserData = (callback: (userData: TelegramUser) => void): void => {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'TELEGRAM_USER_DATA' && event.data.userData) {
      callback(event.data.userData);
      
      // Notify Telegram that app is ready
      const tg = getTelegramWebApp();
      if (tg) {
        event.source?.postMessage({ type: 'APP_READY' }, { targetOrigin: '*' });
      }
    }
  });
};

// Send message to Telegram parent (if in iframe)
export const sendToTelegramParent = (message: any): void => {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, { targetOrigin: '*' });
  }
};

// Set up main button for Telegram
export const setupTelegramMainButton = (text: string, onClick: () => void): void => {
  const tg = getTelegramWebApp();
  
  if (tg && tg.MainButton) {
    tg.MainButton.setText(text);
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
  }
};

// Get stored Telegram user data
export const getStoredTelegramUser = (): TelegramUser | null => {
  try {
    const userData = localStorage.getItem('telegramUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing Telegram user data:', error);
    return null;
  }
};

// Check if user came from Telegram
export const isFromTelegram = (): boolean => {
  return getStoredTelegramUser() !== null || isTelegramWebApp();
};

// Telegram-specific styles
export const getTelegramStyles = (): React.CSSProperties => {
  if (isTelegramWebApp()) {
    return {
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#667eea',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };
  }
  
  return {};
};

// Export for use in React components
export const useTelegramWebApp = () => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  
  useEffect(() => {
    // Check if in Telegram WebApp
    const inTelegram = isTelegramWebApp();
    setIsTelegram(inTelegram);
    
    if (inTelegram) {
      // Initialize WebApp
      const user = initTelegramWebApp();
      if (user) {
        setTelegramUser(user);
      }
    } else {
      // Check for stored user data (from iframe)
      const storedUser = getStoredTelegramUser();
      if (storedUser) {
        setTelegramUser(storedUser);
        setIsTelegram(true);
      }
      
      // Listen for messages from parent (iframe scenario)
      listenForTelegramUserData((userData) => {
        setTelegramUser(userData);
        setIsTelegram(true);
      });
    }
  }, []);
  
  return {
    telegramUser,
    isTelegram,
    telegramWebApp: getTelegramWebApp()
  };
};
