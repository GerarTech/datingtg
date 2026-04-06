import React, { useState } from 'react';
import { AgeSelectionScreen } from './AgeSelectionScreen';
import { GenderSelectionScreen } from './GenderSelectionScreen';

interface OnboardingFlowProps {
  onComplete?: (data: { age: number; gender: string }) => void;
  onBack?: () => void;
}

export function OnboardingFlow({ onComplete, onBack }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<'age' | 'gender'>('age');
  const [onboardingData, setOnboardingData] = useState<{ age?: number; gender?: string }>({});

  const handleAgeNext = (age: number) => {
    setOnboardingData(prev => ({ ...prev, age }));
    setCurrentStep('gender');
  };

  const handleGenderNext = (gender: string) => {
    const finalData = { ...onboardingData, gender };
    setOnboardingData(finalData);
    
    if (onComplete && finalData.age) {
      onComplete({ age: finalData.age, gender });
    }
  };

  const handleBack = () => {
    if (currentStep === 'gender') {
      setCurrentStep('age');
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="w-full h-full">
      {currentStep === 'age' && (
        <AgeSelectionScreen
          onNext={handleAgeNext}
          onBack={onBack}
        />
      )}
      
      {currentStep === 'gender' && (
        <GenderSelectionScreen
          onNext={handleGenderNext}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
