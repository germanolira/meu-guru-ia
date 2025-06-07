import OnboardingScreen from "@/components/OnboardingScreen";
import { useOnboardingRoute } from "@/hooks/useProtectedRoute";
import React from "react";

export default function OnboardingPage() {
  const { isLoading } = useOnboardingRoute();

  if (isLoading) {
    return null;
  }

  return <OnboardingScreen />;
}
