import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { AnimatedIcon } from "./AnimatedIcon";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface ChatInputProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSendMessage: () => void;
  onAttachmentPress?: () => void;
  onLayoutContainer?: (event: any) => void;
  onToggleThinkingMode?: () => void;
  isThinkingActive?: boolean;
  onToggleSearchMode?: () => void;
  isSearchMode?: boolean;
  hasUserSentMessage?: boolean;
  canShowNewQuestion?: boolean;
  onNewQuestion?: () => void;
}

export function ChatInput({
  inputText,
  onChangeText,
  onSendMessage,
  onLayoutContainer,
  onToggleThinkingMode,
  isThinkingActive = false,
  onToggleSearchMode,
  isSearchMode = false,
  hasUserSentMessage = false,
  canShowNewQuestion = false,
  onNewQuestion,
  onAttachmentPress,
}: ChatInputProps) {
  const keyboard = useAnimatedKeyboard();
  const insets = useSafeAreaInsets();

  const initialHasText = inputText.trim() !== "";
  const sendButtonScale = useSharedValue(initialHasText ? 1 : 0.7);
  const sendButtonOpacity = useSharedValue(initialHasText ? 1 : 0.5);
  const sendButtonRotation = useSharedValue(0);
  const containerScale = useSharedValue(1);
  const inputContainerScale = useSharedValue(1);
  const glowAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);

  const [isEffectivelyEnabled, setIsEffectivelyEnabled] =
    React.useState(initialHasText);

  React.useEffect(() => {
    const hasText = inputText.trim() !== "";
    setIsEffectivelyEnabled(hasText);

    if (hasText) {
      sendButtonScale.value = withSpring(1, {
        damping: 12,
        stiffness: 250,
      });
      sendButtonOpacity.value = withTiming(1, { duration: 300 });
      glowAnimation.value = withTiming(1, { duration: 400 });

      pulseAnimation.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    } else {
      sendButtonScale.value = withSpring(0.7, {
        damping: 15,
        stiffness: 200,
      });
      sendButtonOpacity.value = withTiming(0.5, { duration: 200 });
      glowAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [inputText]);

  const handleTextChange = (text: string) => {
    onChangeText(text);
    const hasText = text.trim() !== "";

    setIsEffectivelyEnabled(hasText);

    if (hasText && !isEffectivelyEnabled) {
      inputContainerScale.value = withSequence(
        withSpring(1.05, { damping: 15, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSend = () => {
    if (!isEffectivelyEnabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    sendButtonScale.value = withSequence(
      withSpring(0.8, { damping: 15, stiffness: 400 }),
      withSpring(1.1, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );

    sendButtonRotation.value = withSequence(
      withTiming(360, { duration: 400, easing: Easing.out(Easing.exp) }),
      withTiming(0, { duration: 0 })
    );

    setTimeout(() => {
      onSendMessage();
    }, 150);
  };

  const handleNewQuestion = () => {
    if (!onNewQuestion) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    containerScale.value = withSequence(
      withSpring(0.95, { damping: 15, stiffness: 400 }),
      withSpring(1.02, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );

    setTimeout(() => {
      onNewQuestion();
    }, 200);
  };

  const animatedSendButtonStyle = useAnimatedStyle(() => {
    const glowIntensity = interpolate(glowAnimation.value, [0, 1], [0, 20]);

    return {
      transform: [
        { scale: sendButtonScale.value * pulseAnimation.value },
        { rotate: `${sendButtonRotation.value}deg` },
      ],
      opacity: sendButtonOpacity.value,
      shadowRadius: glowIntensity,
    };
  });

  const animatedKeyboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -Math.max(keyboard.height.value, 0) }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const animatedInputContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputContainerScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(glowAnimation.value, [0, 1], [0, 0.3]);

    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[animatedKeyboardStyle, { paddingBottom: insets.bottom }]}
      onLayout={onLayoutContainer}
    >
      <Animated.View
        className="absolute bottom-0 left-0 right-0 h-24 -z-10 bg-indigo-500/[0.03]"
        style={animatedGlowStyle}
      />

      <View>
        {hasUserSentMessage && canShowNewQuestion ? (
          <Animated.View
            style={animatedContainerStyle}
            className="flex-row items-center justify-center px-6 py-5"
          >
            <TouchableOpacity
              onPress={handleNewQuestion}
              className="px-8 py-4 rounded-full shadow-lg flex-row items-center gap-3 border-2 border-white/20 bg-indigo-500"
              style={{
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              <View className="bg-white/25 p-1.5 rounded-full">
                <Ionicons name="add" size={22} color="white" />
              </View>
              <Text className="text-white text-lg font-bold tracking-wide">
                Novo Chat
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View className="flex-row items-end px-5 py-4 gap-4">
            <Animated.View
              className="flex-1 min-h-[52px] rounded-3xl border-2 flex-row items-end p-1.5 bg-white/[0.98] border-indigo-500/20"
              style={[
                animatedInputContainerStyle,
                {
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 8,
                },
              ]}
            >
              <TouchableOpacity
                onPress={onAttachmentPress}
                className="h-11 w-11 justify-center items-center bg-indigo-50 rounded-full border border-indigo-200"
                style={{
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Ionicons name="camera" size={20} color="#6366f1" />
              </TouchableOpacity>
              <TextInput
                className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 text-[17px] leading-[22px] font-medium text-gray-800"
                placeholder="Digite sua pergunta"
                value={inputText}
                onChangeText={handleTextChange}
                multiline
                placeholderTextColor="#888888"
                maxLength={2000}
                underlineColorAndroid="transparent"
                textAlignVertical="top"
                editable={!hasUserSentMessage}
              />

              {onToggleSearchMode && !hasUserSentMessage && (
                <View className="h-11 w-11 justify-center items-center mx-1">
                  <AnimatedIcon
                    name="globe-outline"
                    size={24}
                    color={
                      isSearchMode ? Colors.light.primary : Colors.light.icon
                    }
                    onPress={onToggleSearchMode}
                    isActive={isSearchMode}
                    style={{
                      borderRadius: 20,
                      padding: 8,
                      backgroundColor: isSearchMode
                        ? "rgba(99, 102, 241, 0.15)"
                        : "transparent",
                    }}
                  />
                </View>
              )}

              {!hasUserSentMessage && (
                <AnimatedTouchableOpacity
                  className={`mr-1 w-11 h-11 rounded-full justify-center items-center ${
                    isEffectivelyEnabled
                      ? "bg-indigo-500 border-2 border-white/30"
                      : "bg-gray-400/60 border border-gray-400/30"
                  }`}
                  style={[
                    animatedSendButtonStyle,
                    {
                      shadowColor: isEffectivelyEnabled
                        ? "#6366f1"
                        : "transparent",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 12,
                      elevation: isEffectivelyEnabled ? 8 : 0,
                    },
                  ]}
                  onPress={handleSend}
                  disabled={!isEffectivelyEnabled}
                >
                  <View
                    className={`w-6 h-6 rounded-xl justify-center items-center ${
                      isEffectivelyEnabled ? "bg-white/25" : "bg-transparent"
                    }`}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={18}
                      color={isEffectivelyEnabled ? "white" : "#9CA3AF"}
                      style={{ fontWeight: "900" }}
                    />
                  </View>
                </AnimatedTouchableOpacity>
              )}
            </Animated.View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
