import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Telegram WebApp Mock/Helper
export const getTelegramWebApp = () => {
  return (window as any).Telegram?.WebApp;
};

export const hapticFeedback = () => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('medium');
  }
};

export const hapticSuccess = () => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred('success');
  }
};