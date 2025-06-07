import * as Haptics from "expo-haptics";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { getCategoryEmoji } from "../../lib/categories";

interface CategoryCardProps {
  category: string;
  count: number;
  onPress: () => void;
}

export function CategoryCard({ category, count, onPress }: CategoryCardProps) {
  const emoji = getCategoryEmoji(category);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 m-2 min-h-[120px] flex-1 border border-gray-100 shadow-lg shadow-indigo-500/10"
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        elevation: 3,
      }}
    >
      <View className="flex-1 justify-between">
        <View className="bg-slate-50 w-12 h-12 rounded-full items-center justify-center mb-3">
          <Text className="text-2xl">{emoji}</Text>
        </View>

        <View className="flex-1">
          <Text
            className="text-gray-800 text-base font-semibold mb-1"
            numberOfLines={1}
          >
            {category}
          </Text>
          <Text className="text-gray-500 text-sm font-medium">
            {count} {count === 1 ? "chat" : "chats"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
