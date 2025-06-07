import { useCallback, useEffect, useState } from 'react';
import { addOrUpdateChat, deleteChat, getChatById, getChats, getFavoriteChats, toggleChatFavorite } from '../lib/storage';
import { Chat, Message } from '../types/chat';
import { useGenerateTitle } from './useGenerateTitle';

export function useChatStorage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { generateTitle, generateTitleAndCategoryFromBot } = useGenerateTitle();

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const savedChats = await getChats();
      setChats(savedChats);
      
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCurrentChat = useCallback(async (messages: Message[]) => {
    if (!currentChatId || messages.length === 0) {
      return;
    }

    const filteredMessages = messages.filter(msg => !msg.isThinking && !msg.isStreaming);
    
    if (filteredMessages.length === 0) {
      return;
    }

    try {
      const now = Date.now();
      const firstUserMessage = filteredMessages.find(msg => msg.isUser)?.text || '';
      const firstBotMessage = filteredMessages.find(msg => !msg.isUser)?.text || '';
      
      let title: string;
      let category: string;
      if (firstUserMessage && firstBotMessage) {
        try {
          const result = await generateTitleAndCategoryFromBot(firstUserMessage, firstBotMessage);
          title = result.title;
          category = result.category;
        } catch (error) {
          title = generateTitle(firstUserMessage);
          category = 'Outros';
        }
      } else {
        title = generateTitle(firstUserMessage);
        category = 'Outros';
      }

      const chatToSave: Chat = {
        id: currentChatId,
        title,
        category,
        messages: filteredMessages,
        createdAt: now,
        updatedAt: now
      };

      await addOrUpdateChat(chatToSave);
      
      setChats(prev => {
        const updated = [...prev];
        const index = updated.findIndex(c => c.id === currentChatId);
        if (index >= 0) {
          updated[index] = chatToSave;
        } else {
          updated.push(chatToSave);
        }
        return updated.sort((a, b) => b.updatedAt - a.updatedAt);
      });
    } catch (error) {
    }
  }, [currentChatId, generateTitle, generateTitleAndCategoryFromBot]);

  const createNewChat = useCallback(() => {
    const newChatId = `chat-${Date.now()}`;
    setCurrentChatId(newChatId);
    setCurrentMessages([]);
  }, []);

  const switchToChat = useCallback(async (chatId: string) => {
    try {
      const chat = await getChatById(chatId);
      if (chat) {
        setCurrentChatId(chatId);
        setCurrentMessages([...chat.messages]);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
      }
    } catch (error) {
    }
  }, []);

  const removeChatById = useCallback(async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      
      if (currentChatId === chatId) {
        createNewChat();
      }
    } catch (error) {
    }
  }, [currentChatId, createNewChat]);

  const saveChatMessages = useCallback((messages: Message[]) => {
    if (messages.some(msg => msg.isUser)) {
      saveCurrentChat(messages);
    } else {
    }
  }, [saveCurrentChat]);

  const toggleFavorite = useCallback(async (chatId: string) => {
    try {
      await toggleChatFavorite(chatId);
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, isFavorite: !chat.isFavorite }
          : chat
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, []);

  const getFavorites = useCallback(async () => {
    try {
      return await getFavoriteChats();
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    currentChatId,
    currentMessages,
    setCurrentMessages,
    isLoading,
    createNewChat,
    switchToChat,
    removeChatById,
    saveChatMessages,
    refreshChats: loadChats,
    toggleFavorite,
    getFavorites
  };
} 