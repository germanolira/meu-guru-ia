import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function AnimatedArrow() {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withDelay(
      300,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
    );

    translateY.value = withDelay(
      300,
      withSequence(
        withTiming(0, {
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
        }),
        withTiming(-5, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        })
      )
    );

    scale.value = withDelay(
      300,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
      })
    );
  }, [translateY, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="items-center py-2">
      <Animated.View style={animatedStyle}>
        <View className="w-6 h-6 items-center justify-center">
          <View className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-gray-400" />
        </View>
      </Animated.View>
    </View>
  );
}
