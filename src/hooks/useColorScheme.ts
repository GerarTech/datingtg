import { useState, useEffect } from 'react';
import { ColorScheme, defaultColorScheme, getCurrentColorScheme, saveColorScheme, applyColorScheme } from '@/lib/colorScheme';

export function useColorScheme() {
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>(defaultColorScheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load color scheme on mount
    const scheme = getCurrentColorScheme();
    setCurrentScheme(scheme);
    applyColorScheme(scheme);
    setIsLoading(false);
  }, []);

  const updateColorScheme = (scheme: ColorScheme) => {
    setCurrentScheme(scheme);
    saveColorScheme(scheme);
  };

  const updateColor = (colorKey: keyof ColorScheme['colors'], value: string) => {
    const newScheme = {
      ...currentScheme,
      colors: {
        ...currentScheme.colors,
        [colorKey]: value
      }
    };
    updateColorScheme(newScheme);
  };

  const resetToDefault = () => {
    updateColorScheme(defaultColorScheme);
  };

  // Get CSS class names for current scheme
  const getCSSClasses = () => {
    const { colors } = currentScheme;
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
      
      // Utility classes
      'border-default': colors.border,
      'overlay': colors.overlay,
    };
  };

  return {
    currentScheme,
    isLoading,
    updateColorScheme,
    updateColor,
    resetToDefault,
    getCSSClasses,
  };
}
