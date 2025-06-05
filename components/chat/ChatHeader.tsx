import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ChatHeaderProps {
  title: string;
  onMenuPress?: () => void;
}

export function ChatHeader({ title, onMenuPress }: ChatHeaderProps) {
  return (
    <View className="py-4 px-5 border-b border-gray-200">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={onMenuPress} className="p-1">
          <FontAwesome6 name="bars-staggered" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
          {title}
        </Text>
        <View className="w-6" />
      </View>
    </View>
  );
}
