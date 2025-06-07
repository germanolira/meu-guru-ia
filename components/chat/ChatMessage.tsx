import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useCopyText } from "../../hooks/useCopyText";
import { useTTS } from "../../hooks/useTTS";
import { Message } from "../../types/chat";
import { LatexRenderer } from "./LatexRenderer";
import { MessageAnnotations } from "./MessageAnnotations";
import { SearchFlow } from "./SearchFlow";
import { ThinkingIndicator } from "./ThinkingIndicator";

interface ChatMessageProps {
  message: Message;
  latexEnabled?: boolean;
}

const renderLatexContent = (text: string, isUser: boolean) => {
  const blockLatexPattern = /\$\$(.*?)\$\$/gs;
  const inlineLatexPattern = /\$([^$]+?)\$/g;
  const parts: Array<{
    type: "text" | "latex";
    content: string;
    isBlock?: boolean;
  }> = [];
  let lastIndex = 0;

  const matches: Array<{
    index: number;
    length: number;
    content: string;
    isBlock: boolean;
  }> = [];
  let match: RegExpExecArray | null;

  while ((match = blockLatexPattern.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      content: match[1].trim(),
      isBlock: true,
    });
  }

  blockLatexPattern.lastIndex = 0;

  while ((match = inlineLatexPattern.exec(text)) !== null) {
    const isInsideBlock = matches.some(
      (blockMatch) =>
        match!.index >= blockMatch.index &&
        match!.index < blockMatch.index + blockMatch.length
    );

    if (!isInsideBlock) {
      matches.push({
        index: match.index,
        length: match[0].length,
        content: match[1].trim(),
        isBlock: false,
      });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  matches.forEach((latexMatch) => {
    if (latexMatch.index > lastIndex) {
      const textContent = text.slice(lastIndex, latexMatch.index);
      if (textContent.trim()) {
        parts.push({
          type: "text",
          content: textContent,
        });
      }
    }

    if (latexMatch.content) {
      parts.push({
        type: "latex",
        content: latexMatch.content,
        isBlock: latexMatch.isBlock,
      });
    }

    lastIndex = latexMatch.index + latexMatch.length;
  });

  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText.trim()) {
      parts.push({
        type: "text",
        content: remainingText,
      });
    }
  }

  if (parts.some((part) => part.type === "latex")) {
    return (
      <View>
        {parts.map((part, index) =>
          part.type === "latex" ? (
            <LatexRenderer
              key={index}
              isUser={isUser}
              isBlock={part.isBlock || false}
            >
              {part.content}
            </LatexRenderer>
          ) : part.content.trim() ? (
            <Markdown
              key={index}
              style={{
                body: {
                  color: isUser ? "#FFFFFF" : "#1F2937",
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
              }}
            >
              {part.content}
            </Markdown>
          ) : null
        )}
      </View>
    );
  }

  return null;
};

export function ChatMessage({
  message,
  latexEnabled = false,
}: ChatMessageProps) {
  const isUser = message.isUser;
  const isSystem = message.role === "system";
  const isBot = !message.isUser;

  const { speak, stop, isPlaying, isLoading } = useTTS();
  const { copyText, isCopied } = useCopyText();

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

  const handleTTS = async () => {
    if (isPlaying) {
      await stop();
    } else {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        alert(
          "Configure sua API key da OpenAI nas variáveis de ambiente para usar o TTS"
        );
        return;
      }
      await speak(message.text);
    }
  };

  const handleCopy = async () => {
    await copyText(message.text);
  };

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

  const latexContent = latexEnabled
    ? renderLatexContent(message.text, isUser)
    : null;

  return (
    <View className={`mb-4 ${message.isUser ? "items-end" : "items-start"}`}>
      <Pressable
        onPress={() => {}}
        style={{
          maxWidth: "90%",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View
          style={[animatedBubbleStyle]}
          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
            message.isUser
              ? "bg-purple-500 rounded-br-md"
              : "bg-gray-100 rounded-bl-md border border-gray-200"
          }`}
        >
          {message.imageUri && (
            <Image
              source={{ uri: message.imageUri }}
              className="w-48 h-48 rounded-lg mb-2"
              resizeMode="cover"
            />
          )}
          {message.isThinking || (message.isStreaming && !message.text) ? (
            <ThinkingIndicator />
          ) : message.isSearching ? (
            <SearchFlow
              isSearching={message.isSearching}
              searchCompleted={message.searchCompleted || false}
              summary={message.searchSummary || ""}
              sources={message.searchSources || []}
            />
          ) : latexEnabled &&
            (message.text.includes("$") || message.text.includes("$$")) ? (
            renderLatexContent(message.text, isUser)
          ) : (
            <Markdown style={markdownStyle}>{message.text}</Markdown>
          )}
          {message.annotations && (
            <MessageAnnotations
              annotations={message.annotations}
              isUser={isUser}
            />
          )}
          {!message.isStreaming && (
            <Text
              className={`text-xs mt-2 ${
                message.isUser ? "text-purple-100" : "text-gray-500"
              }`}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>
      </Pressable>

      {!message.isThinking && !message.isStreaming && message.text && (
        <View
          className={`flex-row mt-2 gap-3 ${
            message.isUser ? "justify-end" : "justify-start"
          }`}
        >
          {!message.isUser && (
            <Pressable
              onPress={handleTTS}
              className="bg-gray-200/80 p-2 rounded-full active:bg-gray-300/80"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <Ionicons
                  name={isPlaying ? "stop" : "volume-high"}
                  size={16}
                  color="#6B7280"
                />
              )}
            </Pressable>
          )}

          <Pressable
            onPress={handleCopy}
            className="bg-gray-200/80 p-2 rounded-full active:bg-gray-300/80"
          >
            <Ionicons
              name={isCopied ? "checkmark" : "copy"}
              size={16}
              color={isCopied ? "#10B981" : "#6B7280"}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}
