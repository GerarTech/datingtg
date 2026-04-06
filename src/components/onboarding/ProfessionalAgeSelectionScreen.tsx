import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { ChevronLeft } from 'lucide-react';

interface ProfessionalAgeSelectionScreenProps {
  onNext?: (age: number) => void;
  onBack?: () => void;
}

export function ProfessionalAgeSelectionScreen({ onNext, onBack }: ProfessionalAgeSelectionScreenProps) {
  const navigate = useNavigate();
  const { updateUser } = useApp();
  const [selectedAge, setSelectedAge] = useState(24);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const itemHeight = 75; 
  const visibleItems = 5;
  const ages = Array.from({ length: 63 }, (_, i) => i + 18); // 18-80

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      // Set the Header and Background color to match your dark scheme
      tg.setHeaderColor('#0B0D14');
      tg.setBackgroundColor('#0B0D14');
      
      if (tg.BackButton) {
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          if (onBack) onBack();
          else navigate(-1);
        });
      }
    }
    return () => {
      window.Telegram?.WebApp?.BackButton?.hide();
    };
  }, [onBack, navigate]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedIndex = ages.indexOf(selectedAge);
      scrollContainerRef.current.scrollTop = selectedIndex * itemHeight;
    }
  }, []);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const scrollTop = scrollContainerRef.current.scrollTop;
    const centerIndex = Math.round(scrollTop / itemHeight);
    const newAge = ages[Math.max(0, Math.min(ages.length - 1, centerIndex))];

    if (newAge !== selectedAge) {
      setSelectedAge(newAge);
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    }

    if (window.scrollTimeout) clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: centerIndex * itemHeight,
        behavior: 'smooth'
      });
    }, 150);
  };

  const handleContinue = () => {
    updateUser({ age: selectedAge });
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    if (onNext) onNext(selectedAge);
    else navigate('/onboarding/gender');
  };

  const handleBack = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-primary flex flex-col overflow-hidden font-sans">
      
      {/* Glow Effect at the top */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-[radial-gradient(circle_at_top,_rgba(255,140,0,0.12),_transparent_70%)] pointer-events-none" />

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5 relative z-10">
        <motion.div 
          className="h-full bg-accent"
          initial={{ width: "0%" }}
          animate={{ width: "35%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Header Section */}
      <div className="pt-16 pb-8 px-8 text-center relative z-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="absolute left-8 top-6 p-3 rounded-2xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-primary mb-3 tracking-tight"
        >
          How old are you?
        </motion.h1>
        <p className="text-secondary text-sm">Select your age to customize your feed</p>
      </div>

      {/* Picker Section */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        
        {/* Selection Indicators (The subtle borders) */}
        <div className="absolute w-full flex flex-col items-center pointer-events-none z-20">
          <div className="w-4/5 h-[1px] bg-border" />
          <div className="h-[75px]" /> 
          <div className="w-4/5 h-[1px] bg-border" />
        </div>

        {/* Scrollable Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory relative z-10"
          style={{ paddingBlock: `${(itemHeight * (visibleItems - 1)) / 2}px` }}
        >
          {ages.map((age) => {
            const isSelected = age === selectedAge;
            return (
              <div
                key={age}
                className="snap-center flex items-center justify-center"
                style={{ height: itemHeight }}
              >
                <motion.span
                  animate={{
                    scale: isSelected ? 1.6 : 1,
                    opacity: isSelected ? 1 : 0.25,
                    color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)'
                  }}
                  className="font-bold text-4xl transition-all duration-300"
                >
                  {age}
                </motion.span>
              </div>
            );
          })}
        </div>

        {/* Fade Overlays (Darkness match) */}
        <div className="absolute top-0 w-full h-40 bg-gradient-to-b from-[#0B0D14] to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#0B0D14] to-transparent pointer-events-none z-20" />
      </div>

      {/* Footer Container */}
      <div className="px-8 pb-10 pt-4 bg-gradient-to-t from-[#0B0D14] via-[#0B0D14]/90 to-transparent relative z-30">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl bg-accent text-primary font-black text-lg shadow-[0_8px_30px_rgb(255,140,0,0.2)]"
        >
          CONTINUE
        </motion.button>
        
        <p className="text-center text-tertiary text-[10px] mt-6 uppercase tracking-widest">
          Secured by Telegram Auth
        </p>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}