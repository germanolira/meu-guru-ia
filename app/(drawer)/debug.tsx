import { refreshGlobalOnboardingState } from "@/hooks/useProtectedRoute";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function DebugScreen() {
  const router = useRouter();

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem("hasSeenOnboarding");

      setTimeout(() => {
        refreshGlobalOnboardingState();
      }, 100);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      Alert.alert("Erro", "Não foi possível resetar o onboarding");
    }
  };

  const handleResetOnboarding = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Reset Onboarding",
      "Tem certeza que deseja resetar o onboarding? Você será redirecionado para a tela de boas-vindas.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Resetar",
          style: "destructive",
          onPress: resetOnboarding,
        },
      ]
    );
  };

  return (
    <View className="flex-1 p-5 bg-gray-50">
      <Text className="text-2xl font-bold mb-4 text-gray-900">
        Configurações de Debug
      </Text>
      <Text className="text-base text-gray-500 mb-8 leading-6">
        Estas são opções apenas para desenvolvimento e debug do aplicativo.
      </Text>

      <TouchableOpacity
        className="bg-violet-500 p-4 rounded-xl items-center mb-4"
        onPress={handleResetOnboarding}
      >
        <Text className="text-white text-base font-semibold mb-1">
          Resetar Onboarding
        </Text>
        <Text className="text-white/80 text-xs">
          Remove o onboarding do armazenamento local
        </Text>
      </TouchableOpacity>
    </View>
  );
}
