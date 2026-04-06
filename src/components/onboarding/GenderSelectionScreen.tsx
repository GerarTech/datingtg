import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTelegram } from '@/hooks/useTelegram';

interface GenderSelectionScreenProps {
  onNext?: (gender: string) => void;
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
  }
}

export function GenderSelectionScreen({ onNext, onBack }: GenderSelectionScreenProps) {
  const navigate = useNavigate();
  const { updateUser } = useApp();
  const { hapticFeedback, hapticSuccess } = useTelegram();
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

  // Handle gender selection
  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
    
    // Light haptic feedback
    hapticFeedback();
  };

  // Continue to next screen
  const handleContinue = () => {
    if (!selectedGender) return;
    
    // Update global state
    updateUser({ gender: selectedGender });
    
    // Success haptic feedback
    hapticSuccess();
    
    // Navigate
    if (onNext) {
      onNext(selectedGender);
    } else {
      navigate('/onboarding/photo');
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
        <h2 className="text-white font-semibold text-lg">Gender Selection</h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-white mb-2">I am a...</h1>
          <p className="text-white/80">Select your gender</p>
        </motion.div>

        {/* Gender Options */}
        <div className="flex flex-col space-y-6 max-w-sm mx-auto w-full">
          {genderOptions.map((option, index) => {
            const isSelected = selectedGender === option.id;
            
            return (
              <motion.button
                key={option.id}
                onClick={() => handleGenderSelect(option.id)}
                className={`
                  relative w-full h-32 rounded-full border-4 transition-all duration-300
                  flex items-center justify-center space-x-4
                  ${isSelected 
                    ? 'bg-gradient-to-r from-[#FF8C00] to-[#FF6B6B] border-[#FF8C00] shadow-2xl scale-105' 
                    : 'bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/40'
                  }
                `}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: isSelected ? 1.05 : 1,
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Icon */}
                <div className={`
                  text-5xl transition-colors duration-300
                  ${isSelected ? 'text-white' : 'text-white/60'}
                `}>
                  {option.icon}
                </div>
                
                {/* Label */}
                <div className="text-left">
                  <div className={`
                    text-xl font-bold transition-colors duration-300
                    ${isSelected ? 'text-white' : 'text-white/80'}
                  `}>
                    {option.label}
                  </div>
                  <div className={`
                    text-sm transition-colors duration-300
                    ${isSelected ? 'text-white/80' : 'text-white/60'}
                  `}>
                    {option.description}
                  </div>
                </div>

                {/* Selection Indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center"
                    >
                      <div className="w-4 h-4 bg-[#FF8C00] rounded-full" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <button className="text-white/60 hover:text-white/80 transition-colors text-sm">
            Prefer not to say
          </button>
        </motion.div>
      </div>

      {/* Bottom Continue Button */}
      <div className="p-6 bg-white/10 backdrop-blur-sm border-t border-white/20">
        <motion.button
          onClick={handleContinue}
          disabled={!selectedGender}
          whileHover={selectedGender ? { scale: 1.02 } : {}}
          whileTap={selectedGender ? { scale: 0.98 } : {}}
          className={`
            w-full py-4 font-semibold rounded-full shadow-lg transition-all duration-200
            ${selectedGender
              ? 'bg-gradient-to-r from-[#FF8C00] to-[#FF6B6B] text-white hover:shadow-xl'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
            }
          `}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
