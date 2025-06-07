import React, { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

interface SearchSummaryProps {
  summary: string;
  timestamp: Date;
}

export function SearchSummary({ summary, timestamp }: SearchSummaryProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withDelay(
      600,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );

    translateY.value = withDelay(
      600,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.back(1.1)),
      })
    );

    scale.value = withDelay(
      600,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.back(1.1)),
      })
    );
  }, [opacity, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const markdownStyle = {
    body: {
      color: "#1F2937",
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: "#111827",
      marginTop: 12,
      marginBottom: 6,
      fontWeight: "bold" as const,
    },
    heading2: {
      color: "#111827",
      marginTop: 10,
      marginBottom: 5,
      fontWeight: "bold" as const,
    },
    heading3: {
      color: "#111827",
      marginTop: 8,
      marginBottom: 4,
      fontWeight: "bold" as const,
    },
    code_block: {
      backgroundColor: "#F9FAFB",
      borderColor: "#E5E7EB",
      color: "#374151",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: "#F3F4F6",
      color: "#DC2626",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 14.5,
    },
    link: {
      color: "#2563EB",
      textDecorationLine: "underline" as const,
    },
  };

  return (
    <View className="items-start mb-4">
      <Animated.View
        style={animatedStyle}
        className="max-w-[80%] px-4 py-3 rounded-2xl bg-amber-50 rounded-bl-md border-2 border-amber-200"
      >
        <View className="flex-row items-center mb-2">
          <View className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
          <Text className="text-amber-700 font-semibold text-sm">
            Resumo da Pesquisa
          </Text>
        </View>

        <Markdown style={markdownStyle}>{summary}</Markdown>

        <Text className="text-xs mt-2 text-amber-600">
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Animated.View>
    </View>
  );
}
