import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { groupChatsByCategory } from "../../lib/categories";
import { Chat } from "../../types/chat";

interface ChatListProps {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onToggleFavorite?: (chatId: string) => void;
}

export function ChatList({
  chats,
  currentChatId,
  isLoading,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onToggleFavorite,
}: ChatListProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const groupedChats = useMemo(() => groupChatsByCategory(chats), [chats]);
  const allCategories = useMemo(
    () => Object.keys(groupedChats),
    [groupedChats]
  );

  const sortedChats = useMemo(() => {
    const sorted = [...chats].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.updatedAt - a.updatedAt;
    });
    return sorted;
  }, [chats]);

  const filteredChats = useMemo(() => {
    let filtered = sortedChats;

    if (showOnlyFavorites) {
      filtered = filtered.filter((chat) => chat.isFavorite);
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((chat) =>
        selectedCategories.includes(chat.category)
      );
    }

    return filtered;
  }, [sortedChats, selectedCategories, showOnlyFavorites]);

  const favoriteChats = useMemo(
    () => filteredChats.filter((chat) => chat.isFavorite),
    [filteredChats]
  );

  const regularChats = useMemo(
    () => filteredChats.filter((chat) => !chat.isFavorite),
    [filteredChats]
  );

  const handleToggleCategory = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleApplyFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterModalVisible(false);
  };

  const handleClearFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategories([]);
    setShowOnlyFavorites(false);
    setFilterModalVisible(false);
  };

  const handleGoToCategories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(history)/select-category");
  };

  const handleDeleteChat = (chat: Chat) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Deletar Chat",
      `Tem certeza que deseja deletar "${chat.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: () => onDeleteChat(chat.id),
        },
      ]
    );
  };

  const handleChatSelect = (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChatSelect(chatId);
  };

  const handleToggleFavorite = (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleFavorite?.(chatId);
  };

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNewChat();
  };

  const handleFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterModalVisible(true);
  };

  const handleToggleOnlyFavorites = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowOnlyFavorites(!showOnlyFavorites);
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

  const getCategoryColor = (category: string) => {
    const colors = {
      Trabalho: "bg-blue-500",
      Pessoal: "bg-green-500",
      Estudos: "bg-purple-500",
      Tecnologia: "bg-orange-500",
      Criativo: "bg-pink-500",
      Geral: "bg-gray-500",
    };
    return colors[category as keyof typeof colors] || "bg-indigo-500";
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-gray-600 mt-2">Carregando chats...</Text>
      </View>
    );
  }

  const renderChatItem = ({ item }: { item: Chat }) => {
    const isActive = item.id === currentChatId;
    const categoryColor = getCategoryColor(item.category);

    return (
      <TouchableOpacity
        className={`bg-white mx-4 mb-4 rounded-xl border-2 ${
          isActive ? "border-violet-500 bg-violet-50" : "border-gray-100"
        }`}
        onPress={() => handleChatSelect(item.id)}
        onLongPress={() => handleDeleteChat(item)}
      >
        <View className="p-5">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text
                className={`text-base font-semibold leading-5 mb-1 ${
                  isActive ? "text-violet-800" : "text-gray-800"
                }`}
                numberOfLines={2}
              >
                {item.title || "Novo Chat"}
              </Text>
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${categoryColor}`}
                />
                <Text className="text-xs text-gray-500 font-medium">
                  {item.category}
                </Text>
              </View>
            </View>
            <View className="items-center">
              <TouchableOpacity
                onPress={() => handleToggleFavorite(item.id)}
                className="mb-2"
              >
                <Ionicons
                  name={item.isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={item.isFavorite ? "#EF4444" : "#9CA3AF"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500">
                {formatDate(item.updatedAt)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500 mr-1">
                {item.messages.length}
              </Text>
              <Text className="text-xs text-gray-400">mensagens</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <React.Fragment>
      <View className="flex-1 bg-white">
        <StatusBar style="auto" />

        {chats.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-6xl mb-4">💭</Text>
            <Text className="text-gray-600 text-center text-lg font-medium mb-2">
              Nenhum chat salvo ainda
            </Text>
            <Text className="text-gray-400 text-center text-sm">
              Comece uma conversa para criar seu primeiro chat!
            </Text>
          </View>
        ) : (
          <View className="flex-1">
            <View className="flex-row justify-between items-center px-4 py-4 bg-gray-50/50">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-violet-500 mr-3" />
                <Text className="text-gray-600 text-sm font-medium">
                  {filteredChats.length} de {chats.length}{" "}
                  {chats.length === 1 ? "chat" : "chats"}
                </Text>
              </View>
              <TouchableOpacity
                className="bg-violet-100 px-3 py-2 rounded-full"
                onPress={handleFilterPress}
              >
                <Text className="text-violet-700 text-sm font-semibold">
                  {selectedCategories.length > 0 || showOnlyFavorites
                    ? `Filtro (${
                        selectedCategories.length + (showOnlyFavorites ? 1 : 0)
                      })`
                    : "🔍 Filtrar"}
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={[]}
              renderItem={() => null}
              ListHeaderComponent={() => (
                <View>
                  {!showOnlyFavorites && favoriteChats.length > 0 && (
                    <View>
                      <View className="px-4 py-3 bg-yellow-50/80">
                        <View className="flex-row items-center">
                          <Ionicons name="heart" size={16} color="#F59E0B" />
                          <Text className="text-sm font-semibold text-yellow-700 ml-2">
                            Favoritos ({favoriteChats.length})
                          </Text>
                        </View>
                      </View>
                      {favoriteChats.map((item) => (
                        <View key={`fav-${item.id}`}>
                          {renderChatItem({ item })}
                        </View>
                      ))}
                      {regularChats.length > 0 && (
                        <View className="px-4 py-3 bg-gray-50/80 mt-2">
                          <View className="flex-row items-center">
                            <Ionicons
                              name="library"
                              size={16}
                              color="#6B7280"
                            />
                            <Text className="text-sm font-semibold text-gray-600 ml-2">
                              Outros Chats ({regularChats.length})
                            </Text>
                          </View>
                        </View>
                      )}
                      {regularChats.map((item) => (
                        <View key={`reg-${item.id}`}>
                          {renderChatItem({ item })}
                        </View>
                      ))}
                    </View>
                  )}
                  {showOnlyFavorites && (
                    <View>
                      {favoriteChats.map((item) => (
                        <View key={`fav-only-${item.id}`}>
                          {renderChatItem({ item })}
                        </View>
                      ))}
                    </View>
                  )}
                  {!showOnlyFavorites && favoriteChats.length === 0 && (
                    <View>
                      {filteredChats.map((item) => (
                        <View key={`all-${item.id}`}>
                          {renderChatItem({ item })}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
              showsVerticalScrollIndicator={false}
              className="flex-1"
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
            />

            <View
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-4"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              <TouchableOpacity
                className="bg-violet-500 mx-4 py-4 px-8 rounded-2xl items-center"
                onPress={handleNewChat}
              >
                <Text className="text-white text-base font-semibold">
                  ✨ Novo Chat
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-end bg-black/50"
          activeOpacity={1}
          onPressOut={() => setFilterModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View
              className="bg-white rounded-t-2xl max-h-[70%]"
              style={{ paddingBottom: insets.bottom + 22 }}
            >
              <View className="p-6 pb-4">
                <Text className="text-xl font-bold text-center mb-5">
                  Filtros
                </Text>

                <TouchableOpacity
                  className={`flex-row items-center py-4 px-4 rounded-xl mb-4 ${
                    showOnlyFavorites
                      ? "bg-yellow-50 border-2 border-yellow-200"
                      : "bg-gray-50"
                  }`}
                  onPress={handleToggleOnlyFavorites}
                >
                  <Ionicons name="heart" size={24} color="#F59E0B" />
                  <Text
                    className={`flex-1 text-base ml-3 ${
                      showOnlyFavorites
                        ? "text-yellow-800 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    Apenas Favoritos
                  </Text>
                  {showOnlyFavorites && (
                    <View className="w-5 h-5 bg-yellow-500 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text className="text-base font-semibold text-gray-800 mb-3">
                  Categorias
                </Text>
                <FlatList
                  data={allCategories}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => {
                    const isSelected = selectedCategories.includes(item);
                    const categoryColor = getCategoryColor(item);

                    return (
                      <TouchableOpacity
                        className={`flex-row items-center py-4 px-4 rounded-xl mb-2 ${
                          isSelected
                            ? "bg-violet-50 border-2 border-violet-200"
                            : "bg-gray-50"
                        }`}
                        onPress={() => handleToggleCategory(item)}
                      >
                        <View
                          className={`w-3 h-3 rounded-full mr-3 ${categoryColor}`}
                        />
                        <Text
                          className={`flex-1 text-base ${
                            isSelected
                              ? "text-violet-800 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {item} ({groupedChats[item].length})
                        </Text>
                        {isSelected && (
                          <View className="w-5 h-5 bg-violet-500 rounded-full items-center justify-center">
                            <Text className="text-white text-xs font-bold">
                              ✓
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
                <View className="flex-row justify-between mt-5 space-x-4">
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
                    onPress={handleClearFilter}
                  >
                    <Text className="text-gray-700 font-semibold">Limpar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-violet-500 py-4 rounded-xl items-center"
                    onPress={handleApplyFilter}
                  >
                    <Text className="text-white font-semibold">Aplicar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </React.Fragment>
  );
}
