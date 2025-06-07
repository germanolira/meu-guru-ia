import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

let globalOnboardingState: {
  hasSeenOnboarding: boolean | null;
  isLoading: boolean;
  listeners: Array<() => void>;
} = {
  hasSeenOnboarding: null,
  isLoading: true,
  listeners: []
};

const checkGlobalOnboardingStatus = async () => {
  try {
    const value = await AsyncStorage.getItem('hasSeenOnboarding');
    const hasSeenValue = value === 'true';
    globalOnboardingState.hasSeenOnboarding = hasSeenValue;
    globalOnboardingState.isLoading = false;
    
    globalOnboardingState.listeners.forEach(listener => listener());
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    globalOnboardingState.hasSeenOnboarding = false;
    globalOnboardingState.isLoading = false;
    
    globalOnboardingState.listeners.forEach(listener => listener());
  }
};

export const refreshGlobalOnboardingState = () => {
  globalOnboardingState.isLoading = true;
  globalOnboardingState.listeners.forEach(listener => listener());
  checkGlobalOnboardingStatus();
};

export function useProtectedRoute() {
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(globalOnboardingState.hasSeenOnboarding);
  const [isLoading, setIsLoading] = useState(globalOnboardingState.isLoading);

  const updateState = useCallback(() => {
    setHasSeenOnboarding(globalOnboardingState.hasSeenOnboarding);
    setIsLoading(globalOnboardingState.isLoading);
    
    if (!globalOnboardingState.isLoading && !globalOnboardingState.hasSeenOnboarding) {
      router.replace('/onboarding');
    }
  }, [router]);

  useEffect(() => {
    if (globalOnboardingState.hasSeenOnboarding === null) {
      checkGlobalOnboardingStatus();
    } else {
      updateState();
    }

    globalOnboardingState.listeners.push(updateState);

    return () => {
      const index = globalOnboardingState.listeners.indexOf(updateState);
      if (index > -1) {
        globalOnboardingState.listeners.splice(index, 1);
      }
    };
  }, [updateState]);

  return {
    hasSeenOnboarding,
    isLoading,
  };
}

export function useOnboardingRoute() {
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(globalOnboardingState.hasSeenOnboarding);
  const [isLoading, setIsLoading] = useState(globalOnboardingState.isLoading);

  const updateState = useCallback(() => {
    setHasSeenOnboarding(globalOnboardingState.hasSeenOnboarding);
    setIsLoading(globalOnboardingState.isLoading);
    
    if (!globalOnboardingState.isLoading && globalOnboardingState.hasSeenOnboarding) {
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    if (globalOnboardingState.hasSeenOnboarding === null) {
      checkGlobalOnboardingStatus();
    } else {
      updateState();
    }

    globalOnboardingState.listeners.push(updateState);

    return () => {
      const index = globalOnboardingState.listeners.indexOf(updateState);
      if (index > -1) {
        globalOnboardingState.listeners.splice(index, 1);
      }
    };
  }, [updateState]);

  return {
    hasSeenOnboarding,
    isLoading,
  };
} 