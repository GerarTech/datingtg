import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

interface AgeSelectionScreenProps {
  onNext?: (age: number) => void;
  onBack?: () => void;
}

// Declare Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        HapticFeedback?: {
          selectionChanged: () => void;
          notificationOccurred: (type: 'success' | 'error' | 'warning') => void;
        };
      };
    };
    scrollTimeout?: NodeJS.Timeout;
  }
}

export function AgeSelectionScreen({ onNext, onBack }: AgeSelectionScreenProps) {
  const navigate = useNavigate();
  const { updateUser } = useApp();
  const [selectedAge, setSelectedAge] = useState(24);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 60;
  const visibleItems = 7;
  const ages = Array.from({ length: 62 }, (_, i) => i + 18); // 18-79

  // Initialize scroll position to center on selected age
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selectedIndex = ages.indexOf(selectedAge);
      const scrollToIndex = selectedIndex - Math.floor(visibleItems / 2);
      container.scrollTop = scrollToIndex * itemHeight;
    }
  }, []);

  // Handle scroll with momentum
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    setIsScrolling(true);
    
    // Clear existing timeout
    if (window.scrollTimeout) {
      clearTimeout(window.scrollTimeout);
    }
    
    // Set new timeout to detect when scrolling stops
    window.scrollTimeout = setTimeout(() => {
      setIsScrolling(false);
      snapToNearestAge();
    }, 150);
  };

  // Snap to nearest age when scrolling stops
  const snapToNearestAge = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const centerIndex = Math.round(scrollTop / itemHeight) + Math.floor(visibleItems / 2);
    const clampedIndex = Math.max(0, Math.min(ages.length - 1, centerIndex));
    const newAge = ages[clampedIndex];
    
    setSelectedAge(newAge);
    
    // Smooth scroll to center
    const scrollToIndex = clampedIndex - Math.floor(visibleItems / 2);
    container.scrollTo({
      top: scrollToIndex * itemHeight,
      behavior: 'smooth'
    });
  };

  // Handle age selection
  const handleAgeSelect = (age: number) => {
    setSelectedAge(age);
    if (scrollContainerRef.current) {
      const selectedIndex = ages.indexOf(age);
      const scrollToIndex = selectedIndex - Math.floor(visibleItems / 2);
      scrollContainerRef.current.scrollTo({
        top: scrollToIndex * itemHeight,
        behavior: 'smooth'
      });
    }
    
    // Haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  // Continue to next screen
  const handleContinue = () => {
    // Update global state
    updateUser({ age: selectedAge });
    
    // Haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    
    // Navigate
    if (onNext) {
      onNext(selectedAge);
    } else {
      navigate('/onboarding/gender');
    }
  };

  // Handle back
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#667eea] flex flex-col">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm border-b border-white/20">
        <button
          onClick={handleBack}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white font-semibold text-lg">Age Selection</h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">How old are you?</h1>
          <p className="text-white/80">You must be 18 or older to use Yene</p>
        </motion.div>

        {/* Age Picker Wheel */}
        <div className="relative max-w-sm mx-auto">
          {/* Selection Indicator */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-10 pointer-events-none">
            <div className="flex justify-center items-center space-x-2">
              <div className="w-16 h-0.5 bg-[#FF8C00] rounded-full" />
              <div className="w-2 h-2 bg-[#FF8C00] rounded-full" />
              <div className="w-16 h-0.5 bg-[#FF8C00] rounded-full" />
            </div>
          </div>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-[420px] overflow-y-auto scrollbar-hide relative"
            style={{
              scrollBehavior: isScrolling ? 'auto' : 'smooth'
            }}
          >
            {/* Top Spacer */}
            <div style={{ height: itemHeight * Math.floor(visibleItems / 2) }} />
            
            {/* Age Items */}
            {ages.map((age, index) => {
              const isSelected = age === selectedAge;
              const distanceFromCenter = Math.abs(ages.indexOf(selectedAge) - index);
              const opacity = distanceFromCenter <= 2 ? 1 : Math.max(0.3, 1 - (distanceFromCenter - 2) * 0.3);
              const scale = distanceFromCenter === 0 ? 1.2 : distanceFromCenter <= 1 ? 1.1 : 1;
              
              return (
                <motion.div
                  key={age}
                  onClick={() => handleAgeSelect(age)}
                  className="flex items-center justify-center cursor-pointer"
                  style={{ height: itemHeight }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity, 
                    scale,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div
                    className={`
                      text-4xl font-bold transition-all duration-200
                      ${isSelected 
                        ? 'text-[#FF8C00] drop-shadow-lg' 
                        : 'text-white/60 hover:text-white/80'
                      }
                    `}
                  >
                    {age}
                  </div>
                </motion.div>
              );
            })}
            
            {/* Bottom Spacer */}
            <div style={{ height: itemHeight * Math.floor(visibleItems / 2) }} />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#667eea] to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#764ba2] to-transparent pointer-events-none" />
        </div>

        {/* Selected Age Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-8"
        >
          <div className="text-5xl font-bold text-[#FF8C00] mb-2">
            {selectedAge}
          </div>
          <div className="text-white/60 text-sm">years old</div>
        </motion.div>
      </div>

      {/* Bottom Continue Button */}
      <div className="p-6 bg-white/10 backdrop-blur-sm border-t border-white/20">
        <motion.button
          onClick={handleContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-[#FF8C00] to-[#FF6B6B] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
