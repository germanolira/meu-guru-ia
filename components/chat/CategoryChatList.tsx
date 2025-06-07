import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Chat } from "../../types/chat";

interface CategoryChatListProps {
  chats: Chat[];
  category: string;
  emoji: string;
}

export function CategoryChatList({
  chats,
  category,
  emoji,
}: CategoryChatListProps) {
  const router = useRouter();

  const handleChatSelect = (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/chats",
      params: { id: chatId },
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      className="bg-white p-5 mx-4 mb-3 rounded-2xl border border-gray-100 shadow-sm flex-row items-center"
      onPress={() => handleChatSelect(item.id)}
    >
      <View className="flex-1">
        <Text
          className="text-gray-800 text-base font-semibold mb-2 leading-5"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text className="text-gray-500 text-sm">
          {formatDate(item.updatedAt)} • {item.messages.length} mensagens
        </Text>
      </View>
      <View className="ml-3 opacity-50">
        <Text className="text-xl text-gray-500 font-light">›</Text>
      </View>
    </TouchableOpacity>
  );

  if (chats.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-6xl mb-4">{emoji}</Text>
        <Text className="text-gray-500 text-center text-lg font-semibold mb-2">
          Nenhum chat em {category} ainda
        </Text>
        <Text className="text-gray-400 text-center text-sm leading-5">
          Seus chats desta categoria aparecerão aqui
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-4 pb-8"
      />
    </View>
  );
}
