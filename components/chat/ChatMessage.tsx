import React, { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Message } from "../../types/chat";
import { ThinkingIndicator } from "./ThinkingIndicator";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.isUser;
  const isSystem = message.role === "system";
  const isBot = !message.isUser;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(isUser ? 10 : 10);
  const scale = useSharedValue(0.97);

  useEffect(() => {
    const commonConfig = { duration: 350, easing: Easing.out(Easing.cubic) };
    const botConfig = { duration: 400, easing: Easing.out(Easing.back(1.1)) };

    opacity.value = withTiming(1, commonConfig);
    translateY.value = withTiming(0, isBot ? botConfig : commonConfig);
    scale.value = withTiming(1, isBot ? botConfig : commonConfig);
  }, [opacity, translateY, scale, isBot]);

  const animatedBubbleStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  const markdownStyle = {
    body: {
      color: isUser ? "#FFFFFF" : isSystem ? "#606060" : "#1F2937",
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: isUser ? "#FFFFFF" : "#111827",
      marginTop: 12,
      marginBottom: 6,
      fontWeight: "bold" as const,
    },
    heading2: {
      color: isUser ? "#FFFFFF" : "#111827",
      marginTop: 10,
      marginBottom: 5,
      fontWeight: "bold" as const,
    },
    heading3: {
      color: isUser ? "#FFFFFF" : "#111827",
      marginTop: 8,
      marginBottom: 4,
      fontWeight: "bold" as const,
    },
    code_block: {
      backgroundColor: isUser ? "rgba(0,0,0,0.25)" : "#F9FAFB",
      borderColor: isUser ? "rgba(255,255,255,0.3)" : "#E5E7EB",
      color: isUser ? "#EFEFEF" : "#374151",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: isUser ? "rgba(0,0,0,0.2)" : "#F3F4F6",
      color: isUser ? "#E0E0E0" : "#DC2626",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 14.5,
    },
    link: {
      color: isUser ? "#BFDBFE" : "#2563EB",
      textDecorationLine: "underline" as const,
    },
  };

  if (isSystem) {
    return (
      <Animated.View
        style={[animatedBubbleStyle]}
        className="self-center bg-gray-200 py-2 px-4 rounded-2xl my-3 max-w-[90%]"
      >
        <Text className="text-sm text-gray-600 text-center">
          {message.text}
        </Text>
      </Animated.View>
    );
  }

  return (
    <View className={`mb-4 ${message.isUser ? "items-end" : "items-start"}`}>
      <Animated.View
        style={[animatedBubbleStyle]}
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          message.isUser
            ? "bg-blue-500 rounded-br-md"
            : "bg-gray-100 rounded-bl-md border border-gray-200"
        }`}
      >
        {message.isThinking ? (
          <ThinkingIndicator />
        ) : (
          <>
            <Markdown style={markdownStyle}>{message.text}</Markdown>
            {!message.isStreaming && (
              <Text
                className={`text-xs mt-2 ${
                  message.isUser ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </>
        )}
      </Animated.View>
    </View>
  );
}
