import React from "react";
import { Text, View } from "react-native";
import { Message } from "../../types/chat";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <View className={`my-1 ${message.isUser ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[80%] px-4 py-3 rounded-3xl ${
          message.isUser
            ? "bg-blue-500 rounded-br-sm"
            : "bg-white rounded-bl-sm shadow-sm"
        }`}
      >
        <Text
          className={`text-base leading-5 ${
            message.isUser ? "text-white" : "text-gray-800"
          }`}
        >
          {message.text}
        </Text>
        <Text className="text-xs mt-1 opacity-70">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
}
