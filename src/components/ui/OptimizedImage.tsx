import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Skip lazy loading for above-the-fold images
  blurDataURL?: string; // Small base64 placeholder
  sizes?: string; // Responsive sizes for srcset
  quality?: number; // 1-100
  format?: 'webp' | 'avif' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
}

// Simple blur placeholder generator (could be enhanced with a real blur hash library)
const generateBlurPlaceholder = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Create a gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1d29');
    gradient.addColorStop(1, '#151821');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL('image/jpeg', 0.1);
};

// CDN URL builder (placeholder for Cloudinary/Imgix integration)
const buildCdnUrl = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
): string => {
  // If it's already a CDN URL, add transformations
  if (src.includes('cloudinary') || src.includes('imgix')) {
    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format && options.format !== 'auto') params.set('fm', options.format);
    
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}${params.toString()}`;
  }
  
  // For local images, just return as-is (in production, you'd upload to CDN)
  return src;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width = 400,
  height = 400,
  priority = false,
  blurDataURL,
  sizes,
  quality = 75,
  format = 'webp',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // Generate blur placeholder if not provided
  const [blurPlaceholder] = useState(() => 
    blurDataURL || generateBlurPlaceholder(width, height)
  );

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Build optimized URLs
  const optimizedSrc = isInView ? buildCdnUrl(src, { width, height, quality, format }) : '';
  const srcSet = isInView && sizes ? `
    ${buildCdnUrl(src, { width: Math.floor(width * 0.5), height: Math.floor(height * 0.5), quality, format })} 1x,
    ${buildCdnUrl(src, { width, height, quality, format })} 2x
  ` : undefined;

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-[#151821] border border-white/10',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-white/40 text-sm">Failed to load</span>
      </div>
    );
  }

  return (
    <div 
      ref={placeholderRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        style={{
          backgroundImage: `url(${blurPlaceholder})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
      
      {/* Loading indicator */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FF8C00]/30 border-t-[#FF8C00] rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Hook for preloading critical images
export const useImagePreloader = (urls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    urls.forEach(url => {
      if (loadedImages.has(url)) return;

      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, url]));
      };
      img.src = buildCdnUrl(url, { quality: 75, format: 'webp' });
    });
  }, [urls, loadedImages]);

  return loadedImages;
};

export default OptimizedImage;
