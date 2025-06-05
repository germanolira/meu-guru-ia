import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { groupChatsByCategory } from '../../lib/categories';
import { Chat } from '../../types/chat';
import { CategoryCard } from './CategoryCard';

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
  const router = useRouter();
  const groupedChats = groupChatsByCategory(chats);
  const categories = Object.entries(groupedChats).sort(([, a], [, b]) => b.length - a.length);

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/(history)/category/[category]',
      params: { category }
    });
  };

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
        onPress={() => {
          console.log('ChatList - Item pressionado:', item.id, 'Mensagens:', item.messages.length);
          onChatSelect(item.id);
        }}
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
              {formatDate(item.updatedAt)} • {item.messages.length} mensagens
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
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Carregando chats...</Text>
      </View>
    );
  }

  const renderCategoryPair = ({ item }: { item: [string, Chat[]][] }) => (
    <View className="flex-row">
      {item.map(([category, categoryChats]) => (
        <CategoryCard
          key={category}
          category={category}
          count={categoryChats.length}
          onPress={() => handleCategoryPress(category)}
        />
      ))}
      {/* Se for ímpar, adicionar um espaço vazio */}
      {item.length === 1 && <View className="flex-1 m-2" />}
    </View>
  );

  // Agrupar categorias em pares para layout de 2 colunas
  const categoryPairs: [string, Chat[]][][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    const pair = categories.slice(i, i + 2);
    categoryPairs.push(pair);
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-100">
        <Text className="text-gray-900 font-bold text-2xl mb-4">Histórico</Text>
        
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-xl flex-row items-center justify-center"
          onPress={onNewChat}
          style={{
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4
          }}
        >
          <Text className="text-white text-center font-semibold text-base">
            ✨ Novo Chat
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      {chats.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-6xl mb-4">💭</Text>
          <Text className="text-gray-500 text-center text-lg font-medium mb-2">
            Nenhum chat salvo ainda
          </Text>
          <Text className="text-gray-400 text-center">
            Comece uma conversa para criar seu primeiro chat!
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* Estatísticas */}
          <View className="px-4 py-4">
            <Text className="text-gray-600 text-sm mb-2">
              {chats.length} {chats.length === 1 ? 'chat' : 'chats'} em {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}
            </Text>
          </View>

          {/* Grid de categorias */}
          <FlatList
            data={categoryPairs}
            renderItem={renderCategoryPair}
            keyExtractor={(item, index) => `pair-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 32 }}
          />
        </View>
      )}
    </View>
  );
} 