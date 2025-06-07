import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

interface Source {
  title: string;
  url: string;
  snippet?: string;
}

interface SearchSourcesProps {
  sources: Source[];
}

export function SearchSources({ sources }: SearchSourcesProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(
      1000,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.ease),
      })
    );

    translateY.value = withDelay(
      1000,
      withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.back(1.1)),
      })
    );
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleSourcePress = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  return (
    <Animated.View style={animatedStyle} className="mt-3 mb-4">
      <View className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <View className="flex-row items-center mb-3">
          <View className="w-2 h-2 bg-slate-500 rounded-full mr-2" />
          <Text className="text-slate-700 font-semibold text-sm">
            Fontes da Pesquisa
          </Text>
        </View>

        <View className="space-y-3">
          {sources.map((source, index) => (
            <SourceItem
              key={index}
              source={source}
              index={index}
              onPress={() => handleSourcePress(source.url)}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

interface SourceItemProps {
  source: Source;
  index: number;
  onPress: () => void;
}

function SourceItem({ source, index, onPress }: SourceItemProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(
      1200 + index * 150,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
    );

    translateX.value = withDelay(
      1200 + index * 150,
      withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
      })
    );
  }, [opacity, translateX, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        className="bg-white rounded-lg border border-slate-300 p-3 active:bg-slate-50"
      >
        <View className="flex-row items-start">
          <View className="flex-1">
            <Text className="text-blue-600 font-medium text-sm mb-1 leading-5">
              {source.title}
            </Text>
            <Text className="text-slate-500 text-xs mb-2">
              {getDomain(source.url)}
            </Text>
            {source.snippet && (
              <Text
                className="text-slate-600 text-xs leading-4"
                numberOfLines={2}
              >
                {source.snippet}
              </Text>
            )}
          </View>
          <View className="ml-2 mt-1">
            <Text className="text-slate-400 text-xs">→</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
