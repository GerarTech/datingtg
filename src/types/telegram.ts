// Shared Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        HapticFeedback?: {
          selectionChanged: () => void;
          notificationOccurred: (type: 'success' | 'error' | 'warning') => void;
          impactOccurred: (type: 'light' | 'medium' | 'heavy') => void;
        };
        BackButton?: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        expand: () => void;
        ready: () => void;
        getMe: () => Promise<any>;
      };
    };
    scrollTimeout?: NodeJS.Timeout;
  }
}

export {};
