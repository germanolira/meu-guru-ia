import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function SearchCompletedIndicator() {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });

    scale.value = withSequence(
      withTiming(1.3, {
        duration: 300,
        easing: Easing.out(Easing.back(1.7)),
      }),
      withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      })
    );

    rotation.value = withDelay(
      100,
      withTiming(360, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
    );
  }, [scale, rotation, opacity]);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <View className="items-center justify-center flex-row bg-green-50 py-3 px-5 rounded-2xl border border-green-200">
      <Animated.View style={animatedCheckStyle} className="w-5 h-5 mr-3">
        <View className="w-5 h-5 bg-green-500 rounded-full items-center justify-center">
          <Text className="text-white text-xs font-bold">✓</Text>
        </View>
      </Animated.View>
      <Text className="text-sm text-green-700 font-medium">
        Pesquisa concluída!
      </Text>
    </View>
  );
}
