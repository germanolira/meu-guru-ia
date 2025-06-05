import React from "react";
import { Text, View } from "react-native";

interface ChatHeaderProps {
  title: string;
}

export function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <View className="bg-blue-500 py-4 px-5 border-b border-gray-200">
      <Text className="text-lg font-bold text-white text-center">{title}</Text>
    </View>
  );
}
