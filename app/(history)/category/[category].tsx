import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useChatStorage } from '../../../hooks/useChatStorage';
import { getCategoryEmoji } from '../../../lib/categories';
import { Chat } from '../../../types/chat';

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const { chats, removeChatById } = useChatStorage();

  // Filtrar chats por categoria
  const categoryChats = chats.filter(chat => chat.category === category);
  const emoji = getCategoryEmoji(category || '');

  const handleChatSelect = (chatId: string) => {
    router.push({
      pathname: "/(history)/[id]",
      params: { id: chatId },
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      className="bg-white p-4 mx-4 mb-3 rounded-xl border border-gray-100"
      onPress={() => handleChatSelect(item.id)}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1
      }}
    >
      <Text className="text-gray-900 font-medium text-base mb-2" numberOfLines={2}>
        {item.title}
      </Text>
      <Text className="text-gray-500 text-sm">
        {formatDate(item.updatedAt)} • {item.messages.length} mensagens
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-500 text-base">← Voltar</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center mt-3">
          <View className="bg-gray-50 w-12 h-12 rounded-full items-center justify-center mr-3">
            <Text className="text-2xl">{emoji}</Text>
          </View>
          <View>
            <Text className="text-gray-900 font-bold text-xl">{category}</Text>
            <Text className="text-gray-500 text-sm">
              {categoryChats.length} {categoryChats.length === 1 ? 'chat' : 'chats'}
            </Text>
          </View>
        </View>
      </View>

      {/* Lista de chats */}
      {categoryChats.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-4xl mb-4">{emoji}</Text>
          <Text className="text-gray-500 text-center text-lg">
            Nenhum chat em {category} ainda
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Seus chats desta categoria aparecerão aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={categoryChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
} 