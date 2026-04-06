import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
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
      };
    };
  }
}

interface TelegramTheme {
  bgColor: string;
  textColor: string;
  hintColor: string;
  linkColor: string;
  buttonColor: string;
  buttonTextColor: string;
  secondaryBgColor: string;
}

const DEFAULT_THEME: TelegramTheme = {
  bgColor: '#0B0D14',
  textColor: '#FFFFFF',
  hintColor: 'rgba(255, 255, 255, 0.5)',
  linkColor: '#FF8C00',
  buttonColor: '#FF8C00',
  buttonTextColor: '#FFFFFF',
  secondaryBgColor: '#151821',
};

export const useTelegramTheme = () => {
  const [theme, setTheme] = useState<TelegramTheme>(DEFAULT_THEME);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);

  // Convert hex color to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  // Calculate luminance of a color
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  };

  // Get contrasting text color
  const getContrastColor = (bgColor: string): string => {
    const luminance = getLuminance(bgColor);
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Initialize Telegram theme
  const initializeTheme = useCallback(() => {
    if (!window.Telegram?.WebApp) {
      setIsTelegramAvailable(false);
      return;
    }

    setIsTelegramAvailable(true);
    const webApp = window.Telegram.WebApp;

    // Initialize WebApp
    if (webApp.ready) {
      webApp.ready();
    }

    // Get theme parameters from Telegram
    const themeParams = webApp.themeParams || {};
    
    const telegramTheme: TelegramTheme = {
      bgColor: themeParams.bg_color || DEFAULT_THEME.bgColor,
      textColor: themeParams.text_color || DEFAULT_THEME.textColor,
      hintColor: themeParams.hint_color || DEFAULT_THEME.hintColor,
      linkColor: themeParams.link_color || DEFAULT_THEME.linkColor,
      buttonColor: themeParams.button_color || DEFAULT_THEME.buttonColor,
      buttonTextColor: themeParams.button_text_color || DEFAULT_THEME.buttonTextColor,
      secondaryBgColor: themeParams.secondary_bg_color || DEFAULT_THEME.secondaryBgColor,
    };

    setTheme(telegramTheme);

    // Set Telegram WebApp colors
    if (webApp.setHeaderColor) {
      webApp.setHeaderColor(telegramTheme.bgColor);
    }
    if (webApp.setBackgroundColor) {
      webApp.setBackgroundColor(telegramTheme.bgColor);
    }

    // Apply theme to CSS variables
    applyThemeToCSS(telegramTheme);
  }, []);

  // Apply theme to CSS variables
  const applyThemeToCSS = useCallback((themeData: TelegramTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--telegram-bg-color', themeData.bgColor);
    root.style.setProperty('--telegram-text-color', themeData.textColor);
    root.style.setProperty('--telegram-hint-color', themeData.hintColor);
    root.style.setProperty('--telegram-link-color', themeData.linkColor);
    root.style.setProperty('--telegram-button-color', themeData.buttonColor);
    root.style.setProperty('--telegram-button-text-color', themeData.buttonTextColor);
    root.style.setProperty('--telegram-secondary-bg-color', themeData.secondaryBgColor);

    // Update our custom color palette if Telegram theme is significantly different
    const luminance = getLuminance(themeData.bgColor);
    if (luminance < 0.2) {
      // Dark theme - use our custom colors
      root.style.setProperty('--background', themeData.bgColor || DEFAULT_THEME.bgColor);
      root.style.setProperty('--card', themeData.secondaryBgColor || DEFAULT_THEME.secondaryBgColor);
      root.style.setProperty('--primary', themeData.buttonColor || DEFAULT_THEME.buttonColor);
      root.style.setProperty('--accent', themeData.linkColor || DEFAULT_THEME.linkColor);
    }
  }, []);

  // Listen for theme changes
  const setupThemeListener = useCallback(() => {
    if (!window.Telegram?.WebApp) return;

    const webApp = window.Telegram.WebApp;
    
    const handleThemeChange = () => {
      initializeTheme();
    };

    if (webApp.onEvent) {
      webApp.onEvent('themeChanged', handleThemeChange);
    }

    return () => {
      if (webApp.offEvent) {
        webApp.offEvent('themeChanged', handleThemeChange);
      }
    };
  }, [initializeTheme]);

  // Initialize on mount
  useEffect(() => {
    initializeTheme();
    const cleanup = setupThemeListener();
    
    return cleanup;
  }, [initializeTheme, setupThemeListener]);

  // Expand WebApp to full height
  const expandWebApp = useCallback(() => {
    if (window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Set header color programmatically
  const setHeaderColor = useCallback((color: string) => {
    if (window.Telegram?.WebApp?.setHeaderColor) {
      window.Telegram.WebApp.setHeaderColor(color);
    }
  }, []);

  // Set background color programmatically
  const setBackgroundColor = useCallback((color: string) => {
    if (window.Telegram?.WebApp?.setBackgroundColor) {
      window.Telegram.WebApp.setBackgroundColor(color);
    }
  }, []);

  return {
    theme,
    isTelegramAvailable,
    expandWebApp,
    setHeaderColor,
    setBackgroundColor,
    getContrastColor,
    hexToRgb,
    rgbToHex,
  };
};
