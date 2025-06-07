import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function DrawerContent(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { navigation } = props;

  const navigateToScreen = (screenName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.closeDrawer();
    router.push(screenName as any);
  };

  const menuItems = [
    {
      label: "Chat",
      icon: "chatbubble-ellipses",
      onPress: () => navigateToScreen("/"),
      description: "Conversar com a IA",
    },
    {
      label: "Histórico",
      icon: "library",
      onPress: () => navigateToScreen("/chats"),
      description: "Meus chats e favoritos",
    },
    {
      label: "Debug",
      icon: "bug",
      onPress: () => navigateToScreen("/debug"),
      description: "Informações técnicas",
    },
  ];

  return (
    <View className="flex-1 bg-violet-500">
      <View
        className="px-8 pb-8"
        style={{ paddingTop: Math.max(insets.top, 24) + 32 }}
      >
        <View className="items-center">
          <Text className="text-3xl font-bold text-white text-center mb-3">
            Meu Guru IA
          </Text>
          <Text className="text-base text-white/90 text-center leading-6">
            Seu assistente inteligente sempre pronto para ajudar
          </Text>
        </View>
      </View>

      <View className="flex-1 bg-white pt-8 px-6">
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="space-y-3">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="bg-gray-50/80 rounded-2xl border border-gray-100/50 shadow-sm active:scale-95"
                onPress={item.onPress}
                style={{
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center py-5 px-5">
                  <View className="w-12 h-12 bg-violet-100 rounded-xl items-center justify-center mr-4">
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color="#8B5CF6"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">
                      {item.label}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item.description}
                    </Text>
                  </View>
                  <View className="w-8 h-8 items-center justify-center">
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mt-8 pt-6 border-t border-gray-100">
            <View className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
              <View className="flex-row items-center mb-3">
                <Text className="text-lg font-bold text-violet-900">
                  Prefere sua atividade resolvida por um tutor especialista?
                </Text>
              </View>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                  <Text className="text-sm text-violet-700 ml-2">
                    Receba dentro do prazo
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                  <Text className="text-sm text-violet-700 ml-2">
                    Converse com o tutor pelo chat
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                  <Text className="text-sm text-violet-700 ml-2">
                    Garantia de 7 dias
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </DrawerContentScrollView>
      </View>
    </View>
  );
}
