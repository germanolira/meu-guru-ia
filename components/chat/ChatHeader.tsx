import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Haptics from "expo-haptics";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatHeaderProps {
  title: string;
  onMenuPress?: () => void;
  onNewChatPress?: () => void;
}

export function ChatHeader({
  title,
  onMenuPress,
  onNewChatPress,
}: ChatHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMenuPress?.();
  };

  const handleNewChatPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNewChatPress?.();
  };

  return (
    <View
      className="px-5 pb-4"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={handleMenuPress} className="p-1">
          <FontAwesome6 name="bars-staggered" size={24} color="#6B7280" />
        </TouchableOpacity>
        <View className="flex-1" />
        <TouchableOpacity
          onPress={handleNewChatPress}
          className="p-1 bg-violet-500 rounded-2xl w-8 h-8 items-center justify-center shadow-lg shadow-violet-500/20"
          style={{
            elevation: 2,
          }}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
