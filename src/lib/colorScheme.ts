export interface ColorScheme {
  id: string;
  name: string;
  colors: {
    // Primary backgrounds
    primary: string;
    secondary: string;
    tertiary: string;
    
    // Accent colors
    accent: string;
    accentSecondary: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    
    // UI elements
    background: string;
    surface: string;
    border: string;
    overlay: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Gradients
    primaryGradient: string;
    accentGradient: string;
    backgroundGradient: string;
    
    // Telegram specific
    telegramHeader: string;
    telegramBackground: string;
  };
}

export const defaultColorScheme: ColorScheme = {
  id: 'default',
  name: 'Yene Default',
  colors: {
    primary: '#0B0D14',
    secondary: '#151821',
    tertiary: '#1A1D29',
    
    accent: '#FF8C00',
    accentSecondary: '#FF6B6B',
    
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textTertiary: 'rgba(255, 255, 255, 0.4)',
    
    background: '#0B0D14',
    surface: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.8)',
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    primaryGradient: 'from-[#0B0D14] to-[#151821]',
    accentGradient: 'from-[#FF8C00] to-[#FF6B6B]',
    backgroundGradient: 'from-[#667eea] via-[#764ba2] to-[#667eea]',
    
    telegramHeader: '#0B0D14',
    telegramBackground: '#0B0D14',
  }
};

export const presetColorSchemes: ColorScheme[] = [
  defaultColorScheme,
  {
    id: 'purple',
    name: 'Purple Dream',
    colors: {
      ...defaultColorScheme.colors,
      primary: '#4C1D95',
      secondary: '#5B21B6',
      tertiary: '#6D28D9',
      accent: '#A855F7',
      accentSecondary: '#C084FC',
      primaryGradient: 'from-[#4C1D95] to-[#6D28D9]',
      backgroundGradient: 'from-[#667eea] via-[#764ba2] to-[#667eea]',
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      ...defaultColorScheme.colors,
      primary: '#0F172A',
      secondary: '#1E293B',
      tertiary: '#334155',
      accent: '#0EA5E9',
      accentSecondary: '#38BDF8',
      primaryGradient: 'from-[#0F172A] to-[#1E293B]',
      backgroundGradient: 'from-[#0EA5E9] via-[#38BDF8] to-[#0F172A]',
    }
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      ...defaultColorScheme.colors,
      primary: '#052E16',
      secondary: '#064E3B',
      tertiary: '#0D9488',
      accent: '#10B981',
      accentSecondary: '#34D399',
      primaryGradient: 'from-[#052E16] to-[#064E3B]',
      backgroundGradient: 'from-[#10B981] via-[#34D399] to-[#052E16]',
    }
  }
];

// Helper functions to generate CSS classes
export function generateCSSClasses(scheme: ColorScheme) {
  const { colors } = scheme;
  
  return {
    // Background classes
    'bg-primary': colors.primary,
    'bg-secondary': colors.secondary,
    'bg-tertiary': colors.tertiary,
    'bg-surface': colors.surface,
    
    // Text classes
    'text-primary': colors.textPrimary,
    'text-secondary': colors.textSecondary,
    'text-tertiary': colors.textTertiary,
    
    // Accent classes
    'text-accent': colors.accent,
    'bg-accent': colors.accent,
    'border-accent': colors.accent,
    
    // Gradient classes
    'bg-primary-gradient': colors.primaryGradient,
    'bg-accent-gradient': colors.accentGradient,
    'bg-background-gradient': colors.backgroundGradient,
    
    // Utility classes
    'border-default': colors.border,
    'overlay': colors.overlay,
  };
}

// Function to apply color scheme to CSS variables
export function applyColorScheme(scheme: ColorScheme) {
  const { colors } = scheme;
  const root = document.documentElement;
  
  // Set CSS variables
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-tertiary', colors.tertiary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-secondary', colors.accentSecondary);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-text-tertiary', colors.textTertiary);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-overlay', colors.overlay);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-error', colors.error);
  root.style.setProperty('--color-info', colors.info);
  root.style.setProperty('--color-primary-gradient', colors.primaryGradient);
  root.style.setProperty('--color-accent-gradient', colors.accentGradient);
  root.style.setProperty('--color-background-gradient', colors.backgroundGradient);
  root.style.setProperty('--color-telegram-header', colors.telegramHeader);
  root.style.setProperty('--color-telegram-background', colors.telegramBackground);
}

// Function to get current color scheme from localStorage
export function getCurrentColorScheme(): ColorScheme {
  const stored = localStorage.getItem('yene-color-scheme');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultColorScheme;
    }
  }
  return defaultColorScheme;
}

// Function to save color scheme to localStorage
export function saveColorScheme(scheme: ColorScheme) {
  localStorage.setItem('yene-color-scheme', JSON.stringify(scheme));
  applyColorScheme(scheme);
}
