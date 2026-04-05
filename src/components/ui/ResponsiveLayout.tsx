import React from 'react';
import { cn } from '@/lib/utils';
import { getResponsiveClasses } from '@/lib/theme';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullScreen?: boolean;
  centered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ResponsiveLayout({ 
  children, 
  className, 
  fullScreen = false,
  centered = false,
  padding = 'md'
}: ResponsiveLayoutProps) {
  const responsiveClasses = getResponsiveClasses();
  
  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-4',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-12'
  };
  
  return (
    <div 
      className={cn(
        // Base layout
        'w-full min-h-screen',
        
        // Background gradient
        'bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#667eea]',
        
        // Full screen if needed
        fullScreen && 'fixed inset-0 overflow-hidden',
        
        // Centering
        centered && 'flex items-center justify-center',
        
        // Padding
        paddingClasses[padding],
        
        // Custom classes
        className
      )}
    >
      <div className={cn(
        responsiveClasses.container,
        centered && 'max-w-4xl'
      )}>
        {children}
      </div>
    </div>
  );
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = 1,
  gap = 'md'
}: ResponsiveGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };
  
  const gapClasses = {
    sm: 'gap-2 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };
  
  return (
    <div className={cn(
      'grid',
      gridClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Responsive card component
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export function ResponsiveCard({ 
  children, 
  className, 
  hover = false,
  glass = true
}: ResponsiveCardProps) {
  return (
    <div 
      className={cn(
        // Base card styles
        'w-full rounded-2xl border transition-all duration-300',
        
        // Glass effect
        glass && 'bg-white/10 backdrop-blur-sm border-white/20',
        
        // Hover effect
        hover && 'hover:bg-white/20 hover:scale-105 hover:shadow-xl',
        
        // Padding
        'p-4 sm:p-6 lg:p-8',
        
        // Custom classes
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive button component
interface ResponsiveButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
}

export function ResponsiveButton({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick
}: ResponsiveButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#FF8C00] to-[#FF6B6B] text-white hover:shadow-lg hover:scale-105',
    secondary: 'bg-white/20 text-white hover:bg-white/30 border border-white/20',
    outline: 'bg-transparent text-white border-2 border-[#FF8C00] hover:bg-[#FF8C00] hover:text-white'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base button styles
        'font-medium rounded-full transition-all duration-300',
        
        // Variants
        variantClasses[variant],
        
        // Sizes
        sizeClasses[size],
        
        // Full width
        fullWidth && 'w-full',
        
        // Custom classes
        className
      )}
    >
      {children}
    </button>
  );
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent';
}

export function ResponsiveText({ 
  children, 
  className, 
  variant = 'body',
  color = 'primary'
}: ResponsiveTextProps) {
  const variantClasses = {
    h1: 'text-3xl sm:text-4xl lg:text-5xl font-bold',
    h2: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    h3: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
    h4: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    body: 'text-base sm:text-lg',
    caption: 'text-sm sm:text-base'
  };
  
  const colorClasses = {
    primary: 'text-white',
    secondary: 'text-white/80',
    tertiary: 'text-white/60',
    accent: 'text-[#FF8C00]'
  };
  
  return (
    <div className={cn(
      variantClasses[variant],
      colorClasses[color],
      className
    )}>
      {children}
    </div>
  );
}
