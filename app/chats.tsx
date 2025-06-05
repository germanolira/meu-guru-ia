import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { ChatList } from '../components/chat/ChatList';
import { useChatStorage } from '../hooks/useChatStorage';

export default function ChatsScreen() {
  const router = useRouter();
  const {
    chats,
    currentChatId,
    isLoading,
    createNewChat,
    switchToChat,
    removeChatById,
  } = useChatStorage();

  const handleChatSelect = async (chatId: string) => {
    router.push({
      pathname: "/(history)/[id]",
      params: { id: chatId },
    });
  };

  const handleNewChat = () => {
    console.log('Criando novo chat');
    createNewChat();
    router.push('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="auto" />
      <ChatList
        chats={chats}
        currentChatId={currentChatId}
        isLoading={isLoading}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={removeChatById}
      />
    </SafeAreaView>
  );
} 