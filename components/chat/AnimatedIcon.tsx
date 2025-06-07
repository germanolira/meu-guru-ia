import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size: number;
  color: string;
  onPress: () => void;
  style?: any;
  isActive?: boolean;
}

function AnimatedIcon({
  name,
  size,
  color,
  onPress,
  style,
  isActive = false,
}: AnimatedIconProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withTiming(0.85, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 100,
      easing: Easing.in(Easing.ease),
    });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  useEffect(() => {
    if (name === "sparkles" && isActive) {
      rotation.value = withSequence(
        withTiming(10, { duration: 120 }),
        withTiming(-8, { duration: 120 }),
        withTiming(5, { duration: 120 }),
        withTiming(0, { duration: 120, easing: Easing.elastic(1) })
      );
      scale.value = withSequence(
        withTiming(1.2, { duration: 120 }),
        withTiming(1, { duration: 120, easing: Easing.elastic(1) })
      );
    }
  }, [isActive, name, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <AnimatedTouchableOpacity
      style={[style, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      className="p-[5px] justify-center items-center"
    >
      <Ionicons name={name} size={size} color={color} />
    </AnimatedTouchableOpacity>
  );
}

export { AnimatedIcon };
