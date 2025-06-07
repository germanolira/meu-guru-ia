import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Annotation } from "../../types/chat";
import { IconSymbol } from "../ui/IconSymbol";

interface MessageAnnotationsProps {
  annotations: Annotation[];
  isUser: boolean;
}

export function MessageAnnotations({
  annotations,
  isUser,
}: MessageAnnotationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const height = useSharedValue(0);
  const rotation = useSharedValue(0);

  if (!annotations || annotations.length === 0) {
    return null;
  }

  const toggleAccordion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
    height.value = withSpring(isExpanded ? 0 : annotations.length * 60, {
      damping: 15,
      stiffness: 150,
    });
    rotation.value = withTiming(isExpanded ? 0 : 180, {
      duration: 200,
    });
  };

  const handleLinkPress = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value > 0 ? 1 : 0,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="mt-3">
      <View className="h-px bg-blue-400/30 my-2" />

      <TouchableOpacity
        onPress={toggleAccordion}
        className={`flex-row items-center justify-between p-3 rounded-lg ${
          isUser
            ? "bg-blue-500/10 border border-blue-400/20"
            : "bg-blue-50 border border-blue-200/60"
        }`}
      >
        <View className="flex-row items-center">
          <IconSymbol
            name="link"
            size={16}
            color={isUser ? "#60A5FA" : "#3B82F6"}
          />
          <Text
            className={`text-sm font-semibold ml-2 ${
              isUser ? "text-blue-300" : "text-blue-700"
            }`}
          >
            Fontes ({annotations.length})
          </Text>
        </View>

        <Animated.View style={arrowStyle}>
          <IconSymbol
            name="chevron.down"
            size={16}
            color={isUser ? "#60A5FA" : "#3B82F6"}
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={animatedStyle} className="overflow-hidden">
        <View className="pt-2 gap-y-2">
          {annotations.map((annotation, index) => {
            const { url, title } = annotation.citation;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleLinkPress(url)}
                className={`flex-row items-center p-3 rounded-lg border ${
                  isUser
                    ? "bg-blue-500/5 border-blue-400/15 hover:bg-blue-500/10"
                    : "bg-blue-50/80 border-blue-200/40 hover:bg-blue-100/60"
                }`}
              >
                <IconSymbol
                  name="link"
                  size={14}
                  color={isUser ? "#93C5FD" : "#60A5FA"}
                />
                <Text
                  className={`ml-3 text-sm flex-shrink ${
                    isUser ? "text-blue-200" : "text-blue-600"
                  }`}
                  numberOfLines={2}
                >
                  {title || url}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}
