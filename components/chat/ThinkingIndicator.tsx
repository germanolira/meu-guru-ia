import React, { useEffect } from "react";
import { View, useColorScheme } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

function ThinkingIndicator() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const translateY1 = useSharedValue(0);
  const opacity1 = useSharedValue(0.4);
  const scale1 = useSharedValue(0.8);

  const translateY2 = useSharedValue(0);
  const opacity2 = useSharedValue(0.4);
  const scale2 = useSharedValue(0.8);

  const translateY3 = useSharedValue(0);
  const opacity3 = useSharedValue(0.4);
  const scale3 = useSharedValue(0.8);

  useEffect(() => {
    const startAnimation = (
      translateY: any,
      opacity: any,
      scale: any,
      delay: number
    ) => {
      const timer = setTimeout(() => {
        translateY.value = withRepeat(
          withSequence(
            withTiming(-8, {
              duration: 500,
              easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            }),
            withTiming(0, {
              duration: 500,
              easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            })
          ),
          -1,
          true
        );

        opacity.value = withRepeat(
          withSequence(
            withTiming(1, {
              duration: 500,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            withTiming(0.4, {
              duration: 500,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            })
          ),
          -1,
          true
        );

        scale.value = withRepeat(
          withSequence(
            withTiming(1.2, {
              duration: 500,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            withTiming(0.8, {
              duration: 500,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            })
          ),
          -1,
          true
        );
      }, delay);

      return timer;
    };

    const timer1 = startAnimation(translateY1, opacity1, scale1, 0);
    const timer2 = startAnimation(translateY2, opacity2, scale2, 200);
    const timer3 = startAnimation(translateY3, opacity3, scale3, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      
      translateY1.value = 0;
      opacity1.value = 0.4;
      scale1.value = 0.8;
      
      translateY2.value = 0;
      opacity2.value = 0.4;
      scale2.value = 0.8;
      
      translateY3.value = 0;
      opacity3.value = 0.4;
      scale3.value = 0.8;
    };
  }, [translateY1, opacity1, scale1, translateY2, opacity2, scale2, translateY3, opacity3, scale3]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY1.value },
      { scale: scale1.value },
    ],
    opacity: opacity1.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY2.value },
      { scale: scale2.value },
    ],
    opacity: opacity2.value,
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY3.value },
      { scale: scale3.value },
    ],
    opacity: opacity3.value,
  }));

  const dotColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';

  return (
    <View className="justify-center items-center min-h-[32px] py-2">
      <View className="flex-row items-center h-[16px] space-x-1">
        <Animated.View
          style={[
            animatedStyle1,
            {
              backgroundColor: dotColor,
              shadowColor: dotColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }
          ]}
          className="w-[8px] h-[8px] rounded-full"
        />
        <Animated.View
          style={[
            animatedStyle2,
            {
              backgroundColor: dotColor,
              shadowColor: dotColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }
          ]}
          className="w-[8px] h-[8px] rounded-full"
        />
        <Animated.View
          style={[
            animatedStyle3,
            {
              backgroundColor: dotColor,
              shadowColor: dotColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }
          ]}
          className="w-[8px] h-[8px] rounded-full"
        />
      </View>
    </View>
  );
}

export { ThinkingIndicator };

