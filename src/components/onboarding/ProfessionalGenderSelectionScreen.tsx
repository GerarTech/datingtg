import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { ChevronLeft } from 'lucide-react';

interface ProfessionalGenderSelectionScreenProps {
  onNext?: (gender: string) => void;
  onBack?: () => void;
}

export function ProfessionalGenderSelectionScreen({ onNext, onBack }: ProfessionalGenderSelectionScreenProps) {
  const navigate = useNavigate();
  const { updateUser } = useApp();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const genderOptions = [
    {
      id: 'Male',
      label: 'Male',
      icon: '♂',
      description: 'Identify as male'
    },
    {
      id: 'Female',
      label: 'Female',
      icon: '♀',
      description: 'Identify as female'
    }
  ];

  // Initialize Telegram WebApp Theme
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
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

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  };

  const handleContinue = () => {
    if (!selectedGender) return;
    updateUser({ gender: selectedGender });
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    
    if (onNext) onNext(selectedGender);
    else navigate('/onboarding/interests');
  };

  const handleBack = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-primary flex flex-col overflow-hidden font-sans">
      {/* Subtle Glow Header */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-[radial-gradient(circle_at_top,_rgba(255,140,0,0.12),_transparent_70%)] pointer-events-none" />

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5 relative z-10">
        <motion.div 
          className="h-full bg-accent"
          initial={{ width: "35%" }}
          animate={{ width: "70%" }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-8 relative z-10">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack}
            className="absolute -left-16 top-0 p-3 rounded-2xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          
          <h1 className="text-3xl font-bold text-primary mb-3 tracking-tight">I am a...</h1>
          <p className="text-secondary text-sm">Select your gender to help us find matches</p>
        </motion.div>

        {/* Gender Options */}
        <div className="flex flex-col space-y-4 w-full max-w-sm">
          {genderOptions.map((option, index) => {
            const isSelected = selectedGender === option.id;
            
            return (
              <motion.button
                key={option.id}
                onClick={() => handleGenderSelect(option.id)}
                className={`
                  relative w-full p-6 rounded-2xl border-2 transition-all duration-300
                  flex items-center space-x-5 overflow-hidden
                  ${isSelected 
                    ? 'bg-[#151821] border-[#FF8C00] shadow-[0_0_20px_rgba(255,140,0,0.1)]' 
                    : 'bg-[#151821] border-white/5 hover:border-white/10'
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Glow for Selected Card */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,140,0,0.05),_transparent_70%)]" />
                )}

                {/* Icon Container */}
                <div className={`
                  w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-colors
                  ${isSelected ? 'bg-[#FF8C00] text-[#0B0D14]' : 'bg-white/5 text-white/60'}
                `}>
                  {option.icon}
                </div>
                
                {/* Text Labels */}
                <div className="text-left relative z-10">
                  <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-white/80'}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-white/40">
                    {option.description}
                  </div>
                </div>

                {/* Selection Dot */}
                <div className="ml-auto">
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${isSelected ? 'border-[#FF8C00]' : 'border-white/10'}
                  `}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-[#FF8C00] rounded-full" />}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Manual Skip/Prefer not to say */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-white/30 hover:text-white/60 transition-colors text-xs uppercase tracking-widest"
        >
          Prefer not to say
        </motion.button>
      </div>

      {/* Footer / Action Button */}
      <div className="px-8 pb-10 pt-4 bg-gradient-to-t from-[#0B0D14] via-[#0B0D14]/90 to-transparent relative z-30">
        <motion.button
          onClick={handleContinue}
          disabled={!selectedGender}
          whileTap={selectedGender ? { scale: 0.97 } : {}}
          className={`
            w-full py-4 rounded-2xl font-black text-lg transition-all duration-300
            ${selectedGender
              ? 'bg-accent text-primary shadow-[0_8px_30px_rgb(255,140,0,0.2)]'
              : 'bg-surface text-tertiary cursor-not-allowed border border-default'
            }
          `}
        >
          CONTINUE
        </motion.button>
      </div>
    </div>
  );
}