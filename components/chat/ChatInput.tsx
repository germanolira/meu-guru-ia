import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
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
  onLayoutContainer?: (event: any) => void;
  onToggleThinkingMode?: () => void;
  isThinkingActive?: boolean;
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
  hasUserSentMessage = false,
  canShowNewQuestion = false,
  onNewQuestion,
}: ChatInputProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const keyboard = useAnimatedKeyboard();
  const insets = useSafeAreaInsets();

  const initialHasText = inputText.trim() !== "";
  const sendButtonScale = useSharedValue(initialHasText ? 1 : 0.9);
  const sendButtonOpacity = useSharedValue(initialHasText ? 1 : 0.4);

  const [isEffectivelyEnabled, setIsEffectivelyEnabled] = React.useState(initialHasText);

  React.useEffect(() => {
    const hasText = inputText.trim() !== "";
    setIsEffectivelyEnabled(hasText);

    const targetScale = hasText ? 1 : 0.9;
    const targetOpacity = hasText ? 1 : 0.4;

    if (sendButtonScale.value !== targetScale) {
      sendButtonScale.value = withTiming(targetScale, {
        duration: 200,
        easing: Easing.out(Easing.exp),
      });
    }
    if (sendButtonOpacity.value !== targetOpacity) {
      sendButtonOpacity.value = withTiming(targetOpacity, {
        duration: 150,
      });
    }
  }, [inputText, sendButtonScale, sendButtonOpacity]);

  const handleTextChange = (text: string) => {
    onChangeText(text);
    const hasText = text.trim() !== "";

    setIsEffectivelyEnabled(hasText);

    sendButtonScale.value = withTiming(hasText ? 1 : 0.9, {
      duration: 200,
      easing: Easing.out(Easing.exp),
    });
    sendButtonOpacity.value = withTiming(hasText ? 1 : 0.4, {
      duration: 150,
    });
  };

  const handleSend = () => {
    if (!isEffectivelyEnabled) return;
    onSendMessage();
  };

  const animatedSendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
    opacity: sendButtonOpacity.value,
  }));

  const animatedKeyboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
  }));

  return (
    <Animated.View
      style={[animatedKeyboardStyle, { paddingBottom: insets.bottom }]}
      className={`
        absolute bottom-0 left-0 right-0 z-[1000]
        ios:bg-[#F7F7F7] android:bg-white
        border-t border-t-[#C0C0C0]
        ios:pb-5 android:pb-0
      `}
      onLayout={onLayoutContainer}
    >
      {hasUserSentMessage && canShowNewQuestion ? (
        <View className="flex-row items-center justify-center px-3 py-2">
          <TouchableOpacity
            onPress={onNewQuestion}
            className="bg-blue-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold text-base">
              Nova Pergunta
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row items-end px-3 py-2 gap-2">
          <View className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex-row items-end p-1">
            <TextInput
              className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 text-base text-gray-800 align-top"
              placeholder="Pergunte ao Meu Guru"
              value={inputText}
              onChangeText={handleTextChange}
              multiline
              placeholderTextColor="#9CA3AF"
              maxLength={2000}
              underlineColorAndroid="transparent"
              textAlignVertical="top"
              editable={!hasUserSentMessage}
            />
            {onToggleThinkingMode && !hasUserSentMessage && (
              <View
                style={{
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  marginHorizontal: 2,
                }}
              >
                <AnimatedIcon
                  name="globe-outline"
                  size={24}
                  color={
                    isThinkingActive ? Colors[theme].primary : Colors[theme].icon
                  }
                  onPress={onToggleThinkingMode}
                  isActive={isThinkingActive}
                  style={{
                    borderRadius: 18,
                  }}
                />
              </View>
            )}
            {!hasUserSentMessage && (
              <AnimatedTouchableOpacity
                style={[animatedSendButtonStyle, { marginRight: 2 }]}
                onPress={handleSend}
                disabled={!isEffectivelyEnabled}
                className={`h-[40px] w-[40px] justify-center items-center rounded-full ${
                  isEffectivelyEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <Ionicons
                  name="arrow-up"
                  size={22}
                  color={isEffectivelyEnabled ? "white" : "#9CA3AF"}
                />
              </AnimatedTouchableOpacity>
            )}
          </View>
        </View>
      )}
    </Animated.View>
  );
}
