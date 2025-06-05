import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ChatHeaderProps {
  title: string;
  onMenuPress?: () => void;
  onNewChatPress?: () => void;
}

export function ChatHeader({ title, onMenuPress, onNewChatPress }: ChatHeaderProps) {
  return (
    <View className="py-4 px-5 border-b border-gray-200">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={onMenuPress} className="p-1">
          <FontAwesome6 name="bars-staggered" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
          {title}
        </Text>
        <TouchableOpacity 
          onPress={onNewChatPress} 
          className="p-1 bg-blue-500 rounded-full w-8 h-8 items-center justify-center"
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
