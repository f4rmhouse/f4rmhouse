'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  resetOnboarding: () => void;
  skipOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [currentStep, setCurrentStepState] = useState<number>(0);

  // Load the current step from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('onboarding-step');
      if (savedStep) {
        setCurrentStepState(parseInt(savedStep, 10));
      }
    }
  }, []);

  // Save to localStorage whenever step changes
  const setCurrentStep = (step: number) => {
    setCurrentStepState(step);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding-step', step.toString());
    }
  };

  const skipOnboarding = () => {
    setCurrentStep(5)
  }

  const completeStep = (step: number) => {
    if (step == currentStep) {
      setCurrentStep(step + 1);
      setCurrentStep(step+1)
    }
  };

  const isStepCompleted = (step: number) => {
    return currentStep > step;
  };

  const resetOnboarding = () => {
    setCurrentStep(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding-step');
    }
  };

  const value: OnboardingContextType = {
    currentStep,
    setCurrentStep,
    completeStep,
    isStepCompleted,
    resetOnboarding,
    skipOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
