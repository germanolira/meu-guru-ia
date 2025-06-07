import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, PanResponder, Text, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");

      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          router.replace("/");
        });
      }, 1200);
    } catch (error) {
      console.error("Error saving onboarding:", error);
    }
  };

  const handlePressIn = () => {
    if (isCompleted) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPressed(true);

    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    timeoutRef.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setIsCompleted(true);
      setShowConfetti(true);

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        completeOnboarding();
      });
    }, 1500);
  };

  const handlePressOut = () => {
    if (isCompleted) return;

    setIsPressed(false);

    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: handlePressIn,
    onPanResponderRelease: handlePressOut,
    onPanResponderTerminate: handlePressOut,
  });

  return (
    <Animated.View
      className="flex-1 bg-white justify-center items-center"
      style={{ opacity: fadeAnim }}
    >
      <Animated.View
        className="absolute inset-0 bg-indigo-500"
        style={{ opacity: fadeAnim }}
      />
      {showConfetti && (
        <>
          <ConfettiCannon
            count={150}
            origin={{ x: width / 2, y: height * 0.8 }}
            explosionSpeed={350}
            fallSpeed={3000}
            fadeOut={true}
            autoStart={true}
          />
          <ConfettiCannon
            count={100}
            origin={{ x: width / 2 - 50, y: height * 0.82 }}
            explosionSpeed={300}
            fallSpeed={2500}
            fadeOut={true}
            autoStart={true}
          />
          <ConfettiCannon
            count={100}
            origin={{ x: width / 2 + 50, y: height * 0.82 }}
            explosionSpeed={300}
            fallSpeed={2500}
            fadeOut={true}
            autoStart={true}
          />
        </>
      )}

      <View className="px-8 items-center w-full">
        <View className="mb-8">
          <Text className="text-8xl">✏️</Text>
        </View>

        <Text className="text-3xl font-bold text-white text-center mb-4">
          Bem-vindo ao Meu Guru IA!
        </Text>
        <Text className="text-lg text-white/90 text-center mb-12 leading-6">
          Seu assistente pessoal com inteligência artificial está pronto para te
          ajudar
        </Text>

        <View className="w-full mb-16">
          <View className="flex-row items-center mb-4 px-4">
            <Text className="text-2xl mr-4">🤖</Text>
            <Text className="text-base text-white/90 font-medium">
              Respostas inteligentes
            </Text>
          </View>
          <View className="flex-row items-center mb-4 px-4">
            <Text className="text-2xl mr-4">💬</Text>
            <Text className="text-base text-white/90 font-medium">
              Conversas naturais
            </Text>
          </View>
          <View className="flex-row items-center mb-4 px-4">
            <Text className="text-2xl mr-4">⚡</Text>
            <Text className="text-base text-white/90 font-medium">
              Respostas rápidas
            </Text>
          </View>
        </View>

        <View className="items-center w-full">
          <Animated.View
            className="bg-white/20 py-4 px-8 rounded-full mb-4 min-w-[250px] items-center justify-center overflow-hidden relative border-2 border-white/30"
            style={{
              transform: [{ scale: scaleAnim }],
            }}
            {...panResponder.panHandlers}
          >
            <Animated.View
              className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-full"
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
            <Text className="text-white text-lg font-semibold z-10">
              {isCompleted
                ? "🎉 Bem-vindo!"
                : isPressed
                ? "Segure para começar..."
                : "Segure para começar"}
            </Text>
          </Animated.View>

          <Text className="text-white/70 text-sm text-center">
            Mantenha pressionado por 1.5 segundos
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
