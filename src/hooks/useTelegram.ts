import { useState, useEffect, useCallback } from 'react';
import { TelegramWebApp } from '../utils/telegram';

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Initialize Telegram WebApp
  useEffect(() => {
    const available = TelegramWebApp.isAvailable();
    setIsAvailable(available);
    
    if (available) {
      TelegramWebApp.ready();
      TelegramWebApp.expand();
      setIsReady(true);
    }
  }, []);

  // Haptic feedback
  const hapticFeedback = useCallback(() => {
    TelegramWebApp.hapticFeedback.selectionChanged();
  }, []);

  const hapticSuccess = useCallback(() => {
    TelegramWebApp.hapticFeedback.notificationOccurred('success');
  }, []);

  const hapticError = useCallback(() => {
    TelegramWebApp.hapticFeedback.notificationOccurred('error');
  }, []);

  const hapticWarning = useCallback(() => {
    TelegramWebApp.hapticFeedback.notificationOccurred('warning');
  }, []);

  // Theme controls
  const setHeaderColor = useCallback((color: string) => {
    TelegramWebApp.theme.setHeaderColor(color);
  }, []);

  const setBackgroundColor = useCallback((color: string) => {
    TelegramWebApp.theme.setBackgroundColor(color);
  }, []);

  // Get user data
  const getUser = useCallback(() => {
    return TelegramWebApp.getUser();
  }, []);

  const getInitData = useCallback(() => {
    return TelegramWebApp.getInitData();
  }, []);

  return {
    // Status
    isReady,
    isAvailable,
    
    // Haptic feedback
    hapticFeedback,
    hapticSuccess,
    hapticError,
    hapticWarning,
    
    // Theme controls
    setHeaderColor,
    setBackgroundColor,
    
    // Data access
    getUser,
    getInitData,
    
    // Direct access to WebApp utilities
    TelegramWebApp,
  };
};
