import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatModalParams {
  title?: string;
  history?: string;
}

function AnimatedChatMessage({
  message,
  index,
}: {
  message: ChatMessage;
  index: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const delay = index * 100;
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.back(1.1)),
    });
  }, [opacity, translateY, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const markdownStyle = {
    body: {
      color: message.isUser ? "#FFFFFF" : "#1F2937",
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: message.isUser ? "#FFFFFF" : "#111827",
      marginTop: 12,
      marginBottom: 6,
      fontWeight: "bold" as const,
    },
    heading2: {
      color: message.isUser ? "#FFFFFF" : "#111827",
      marginTop: 10,
      marginBottom: 5,
      fontWeight: "bold" as const,
    },
    code_block: {
      backgroundColor: message.isUser ? "rgba(0,0,0,0.25)" : "#F9FAFB",
      borderColor: message.isUser ? "rgba(255,255,255,0.3)" : "#E5E7EB",
      color: message.isUser ? "#EFEFEF" : "#374151",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: message.isUser ? "rgba(0,0,0,0.2)" : "#F3F4F6",
      color: message.isUser ? "#E0E0E0" : "#DC2626",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 14.5,
    },
    link: {
      color: message.isUser ? "#BFDBFE" : "#2563EB",
      textDecorationLine: "underline" as const,
    },
  };

  return (
    <Animated.View
      style={[animatedStyle]}
      className={`mb-4 ${message.isUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          message.isUser
            ? "bg-violet-500 rounded-br-md"
            : "bg-gray-100 rounded-bl-md border border-gray-200"
        }`}
      >
        <Markdown style={markdownStyle}>{message.text}</Markdown>
        <Text
          className={`text-xs mt-2 ${
            message.isUser ? "text-violet-100" : "text-gray-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function ChatModal() {
  const { title, history } = useLocalSearchParams();
  const router = useRouter();

  const chatHistory: ChatMessage[] = history
    ? JSON.parse(decodeURIComponent(history as string))
    : [];

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);

  useEffect(() => {
    headerOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    headerTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.back(1.1)),
    });
  }, [headerOpacity, headerTranslateY]);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  return (
    <View className="flex-1 bg-white">
      <View className="absolute inset-0 bg-violet-500" />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Animated.View style={animatedHeaderStyle} className="px-8 pt-8">
          <View className="items-center">
            <Text className="text-3xl font-bold text-white text-center">
              {title || "Conversa"}
            </Text>
          </View>
        </Animated.View>

        <View className="flex-1 bg-white rounded-t-3xl mt-4">
          {chatHistory.length > 0 ? (
            <ScrollView
              className="flex-1 px-4 pt-6"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {chatHistory.map((message, index) => (
                <AnimatedChatMessage
                  key={message.id || index}
                  message={message}
                  index={index}
                />
              ))}
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-6xl mb-4">💭</Text>
              <Text className="text-xl font-semibold text-gray-800 text-center mb-2">
                Nenhuma mensagem encontrada
              </Text>
              <Text className="text-gray-500 text-center leading-6">
                Este chat ainda não possui mensagens salvas
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
