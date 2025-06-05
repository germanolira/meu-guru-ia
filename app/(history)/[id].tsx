import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { ChatMessageList } from "../../components/chat/ChatMessageList";
import { getChatById } from "../../lib/storage";
import { Chat } from "../../types/chat";

export default function ChatHistoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chat, setChat] = useState<Chat | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string' && !id.startsWith('[')) {
      getChatById(id).then((chatData) => {
        if (chatData) {
          setChat(chatData);
        }
      });
    }
  }, [id]);

  if (!chat || !id || typeof id !== 'string' || id.startsWith('[')) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <Text>Carregando chat...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center py-4 px-5 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          className="text-lg font-bold text-gray-800 flex-1 text-center"
          numberOfLines={1}
        >
          {chat.title}
        </Text>
        <View className="w-6" />
      </View>
      <ChatMessageList messages={chat.messages} chatInputHeight={0} />
    </SafeAreaView>
  );
} 