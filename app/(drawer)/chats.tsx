import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatList } from "../../components/chat/ChatList";
import { useChatStorage } from "../../hooks/useChatStorage";

export default function ChatsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {
    chats,
    currentChatId,
    isLoading,
    createNewChat,
    removeChatById,
    toggleFavorite,
  } = useChatStorage();

  const handleChatSelect = async (chatId: string) => {
    const selectedChat = chats.find((chat) => chat.id === chatId);
    if (selectedChat) {
      router.push({
        pathname: "/[id]",
        params: {
          id: chatId,
          title: selectedChat.title,
          history: encodeURIComponent(JSON.stringify(selectedChat.messages)),
        },
      });
    }
  };

  const handleNewChat = () => {
    createNewChat();
    router.push("/");
  };

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View className="flex-1 bg-white">
      <View className="absolute inset-0 bg-violet-500" />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="absolute top-12 left-2 z-10 p-2">
          <TouchableOpacity onPress={handleMenuPress}>
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View className="px-8 pt-8 pb-6 relative">
          <View className="items-center">
            <View className="mb-4 mt-4">
              <Text className="text-4xl">💬</Text>
            </View>
            <Text className="text-3xl font-bold text-white text-center mb-3">
              Histórico de Chats
            </Text>
            <Text className="text-base text-white/90 text-center leading-6">
              Todos os seus chats organizados em um só lugar
            </Text>
          </View>
        </View>

        <View className="flex-1 bg-white mt-4 pt-2">
          <ChatList
            chats={chats}
            currentChatId={currentChatId}
            isLoading={isLoading}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            onDeleteChat={removeChatById}
            onToggleFavorite={toggleFavorite}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
