// Centralized Telegram WebApp utilities to prevent errors when running in standard browser

// Use type assertion to avoid conflicts with existing declarations
interface TelegramWebAppInterface {
  HapticFeedback?: {
    selectionChanged: () => void;
    notificationOccurred: (type: 'success' | 'error' | 'warning') => void;
  };
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  ready?: () => void;
  expand?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  onEvent?: (eventType: string, callback: () => void) => void;
  offEvent?: (eventType: string, callback: () => void) => void;
  initDataUnsafe?: {
    user?: any;
  };
  initData?: string;
}

// Safe Telegram WebApp access
export const TelegramWebApp = {
  // Check if Telegram WebApp is available
  isAvailable: (): boolean => {
    return typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp;
  },

  // Get WebApp instance safely
  getWebApp: (): TelegramWebAppInterface | null => {
    if (!TelegramWebApp.isAvailable()) {
      return null;
    }
    return (window as any).Telegram!.WebApp!;
  },

  // Haptic feedback
  hapticFeedback: {
    selectionChanged: () => {
      const webApp = TelegramWebApp.getWebApp();
      if (webApp?.HapticFeedback?.selectionChanged) {
        webApp.HapticFeedback.selectionChanged();
      }
    },
    notificationOccurred: (type: 'success' | 'error' | 'warning') => {
      const webApp = TelegramWebApp.getWebApp();
      if (webApp?.HapticFeedback?.notificationOccurred) {
        webApp.HapticFeedback.notificationOccurred(type);
      }
    },
  },

  // Theme utilities
  theme: {
    getParams: () => {
      const webApp = TelegramWebApp.getWebApp();
      return webApp?.themeParams || {};
    },

    setHeaderColor: (color: string) => {
      const webApp = TelegramWebApp.getWebApp();
      if (webApp?.setHeaderColor) {
        webApp.setHeaderColor(color);
      }
    },

    setBackgroundColor: (color: string) => {
      const webApp = TelegramWebApp.getWebApp();
      if (webApp?.setBackgroundColor) {
        webApp.setBackgroundColor(color);
      }
    },

    onThemeChanged: (callback: () => void) => {
      const webApp = TelegramWebApp.getWebApp();
      if (webApp?.onEvent) {
        webApp.onEvent('themeChanged', callback);
      }
    },

    offThemeChanged: (callback: () => void) => {
      const webApp = TelegramWebApp.getWebApp();
      if (webApp?.offEvent) {
        webApp.offEvent('themeChanged', callback);
      }
    },
  },

  // WebApp initialization
  ready: () => {
    const webApp = TelegramWebApp.getWebApp();
    if (webApp?.ready) {
      webApp.ready();
    }
  },

  expand: () => {
    const webApp = TelegramWebApp.getWebApp();
    if (webApp?.expand) {
      webApp.expand();
    }
  },

  // Get user data safely
  getUser: () => {
    const webApp = TelegramWebApp.getWebApp();
    return webApp?.initDataUnsafe?.user || null;
  },

  // Get init data safely
  getInitData: () => {
    const webApp = TelegramWebApp.getWebApp();
    return webApp?.initData || '';
  },
};

// Theme management utilities
export const TelegramTheme = {
  // Default theme colors
  default: {
    bgColor: '#0B0D14',
    textColor: '#FFFFFF',
    hintColor: 'rgba(255, 255, 255, 0.5)',
    linkColor: '#FF8C00',
    buttonColor: '#FF8C00',
    buttonTextColor: '#FFFFFF',
    secondaryBgColor: '#151821',
  },

  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // Calculate luminance
  getLuminance: (hex: string): number => {
    const rgb = TelegramTheme.hexToRgb(hex);
    if (!rgb) return 0;
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  },

  // Get contrasting color
  getContrastColor: (bgColor: string): string => {
    const luminance = TelegramTheme.getLuminance(bgColor);
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  },

  // Apply theme to CSS variables
  applyToCSS: (theme: Partial<typeof TelegramTheme.default>) => {
    const root = document.documentElement;
    const finalTheme = { ...TelegramTheme.default, ...theme };
    
    root.style.setProperty('--telegram-bg-color', finalTheme.bgColor);
    root.style.setProperty('--telegram-text-color', finalTheme.textColor);
    root.style.setProperty('--telegram-hint-color', finalTheme.hintColor);
    root.style.setProperty('--telegram-link-color', finalTheme.linkColor);
    root.style.setProperty('--telegram-button-color', finalTheme.buttonColor);
    root.style.setProperty('--telegram-button-text-color', finalTheme.buttonTextColor);
    root.style.setProperty('--telegram-secondary-bg-color', finalTheme.secondaryBgColor);

    // Update our custom color palette
    root.style.setProperty('--background', finalTheme.bgColor);
    root.style.setProperty('--card', finalTheme.secondaryBgColor);
    root.style.setProperty('--primary', finalTheme.buttonColor);
    root.style.setProperty('--accent', finalTheme.linkColor);
  },

  // Initialize theme from Telegram
  initialize: () => {
    if (!TelegramWebApp.isAvailable()) {
      // Apply default theme in non-Telegram environment
      TelegramTheme.applyToCSS(TelegramTheme.default);
      return;
    }

    const themeParams = TelegramWebApp.theme.getParams();
    const telegramTheme = {
      bgColor: themeParams.bg_color || TelegramTheme.default.bgColor,
      textColor: themeParams.text_color || TelegramTheme.default.textColor,
      hintColor: themeParams.hint_color || TelegramTheme.default.hintColor,
      linkColor: themeParams.link_color || TelegramTheme.default.linkColor,
      buttonColor: themeParams.button_color || TelegramTheme.default.buttonColor,
      buttonTextColor: themeParams.button_text_color || TelegramTheme.default.buttonTextColor,
      secondaryBgColor: themeParams.secondary_bg_color || TelegramTheme.default.secondaryBgColor,
    };

    // Apply theme to CSS
    TelegramTheme.applyToCSS(telegramTheme);

    // Set Telegram WebApp colors
    TelegramWebApp.theme.setHeaderColor(telegramTheme.bgColor);
    TelegramWebApp.theme.setBackgroundColor(telegramTheme.bgColor);

    // Listen for theme changes
    TelegramWebApp.theme.onThemeChanged(() => {
      TelegramTheme.initialize();
    });

    return telegramTheme;
  },
};

export default TelegramWebApp;
