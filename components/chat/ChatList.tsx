import React from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Chat } from '../../types/chat';

interface ChatListProps {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatList({
  chats,
  currentChatId,
  isLoading,
  onChatSelect,
  onNewChat,
  onDeleteChat,
}: ChatListProps) {
  const handleDeleteChat = (chat: Chat) => {
    Alert.alert(
      'Deletar Chat',
      `Tem certeza que deseja deletar "${chat.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => onDeleteChat(chat.id),
        },
      ]
    );
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

  const renderChatItem = ({ item }: { item: Chat }) => {
    const isSelected = item.id === currentChatId;

    return (
      <TouchableOpacity
        className={`p-4 border-b border-gray-200 ${
          isSelected ? 'bg-blue-50' : 'bg-white'
        }`}
        onPress={() => onChatSelect(item.id)}
        onLongPress={() => handleDeleteChat(item)}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text
              className={`text-base font-medium ${
                isSelected ? 'text-blue-600' : 'text-gray-900'
              }`}
              numberOfLines={2}
            >
              {item.title || 'Chat sem título'}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {formatDate(item.updatedAt)}
            </Text>
          </View>
          {isSelected && (
            <View className="w-3 h-3 bg-blue-500 rounded-full" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Carregando chats...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg"
          onPress={onNewChat}
        >
          <Text className="text-white text-center font-medium">
            + Novo Chat
          </Text>
        </TouchableOpacity>
      </View>

      {chats.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500 text-center">
            Nenhum chat salvo ainda.{'\n'}Comece uma conversa para criar seu primeiro chat!
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
} 