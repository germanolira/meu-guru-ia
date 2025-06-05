import { useCallback, useEffect, useState } from 'react';
import { addOrUpdateChat, deleteChat, getChatById, getChats } from '../lib/storage';
import { Chat, Message } from '../types/chat';
import { useGenerateTitle } from './useGenerateTitle';

export function useChatStorage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { generateTitle, generateTitleFromBot } = useGenerateTitle();

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedChats = await getChats();
      setChats(savedChats);
      
      if (!currentChatId && savedChats.length > 0) {
        const latestChat = savedChats.sort((a, b) => b.updatedAt - a.updatedAt)[0];
        setCurrentChatId(latestChat.id);
        setCurrentMessages(latestChat.messages);
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId]);

  const saveCurrentChat = useCallback(async (messages: Message[]) => {
    if (!currentChatId || messages.length === 0) return;

    try {
      const now = Date.now();
      const firstUserMessage = messages.find(msg => msg.isUser)?.text || '';
      const firstBotMessage = messages.find(msg => !msg.isUser && !msg.isThinking && !msg.isStreaming)?.text || '';
      
      let title: string;
      if (firstUserMessage && firstBotMessage) {
        title = await generateTitleFromBot(firstUserMessage, firstBotMessage);
      } else {
        title = generateTitle(firstUserMessage);
      }

      const chatToSave: Chat = {
        id: currentChatId,
        title,
        messages,
        createdAt: now,
        updatedAt: now
      };

      await addOrUpdateChat(chatToSave);
      
      // Atualizar lista local
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
      console.error('Erro ao salvar chat:', error);
    }
  }, [currentChatId, generateTitle, generateTitleFromBot]);

  // Criar novo chat
  const createNewChat = useCallback(() => {
    const newChatId = `chat-${Date.now()}`;
    setCurrentChatId(newChatId);
    setCurrentMessages([]);
  }, []);

  // Alternar para um chat existente
  const switchToChat = useCallback(async (chatId: string) => {
    try {
      const chat = await getChatById(chatId);
      if (chat) {
        setCurrentChatId(chatId);
        setCurrentMessages(chat.messages);
      }
    } catch (error) {
      console.error('Erro ao carregar chat:', error);
    }
  }, []);

  // Deletar chat
  const removeChatById = useCallback(async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      
      // Se o chat atual foi deletado, criar um novo
      if (currentChatId === chatId) {
        createNewChat();
      }
    } catch (error) {
      console.error('Erro ao deletar chat:', error);
    }
  }, [currentChatId, createNewChat]);

  // Salvar mensagens sem atualizar estado local (para evitar loops)
  const saveChatMessages = useCallback((messages: Message[]) => {
    // Auto-salvar quando há pelo menos uma mensagem do usuário
    if (messages.some(msg => msg.isUser)) {
      saveCurrentChat(messages);
    }
  }, [saveCurrentChat]);

  // Carregar chats na inicialização
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    currentChatId,
    currentMessages,
    isLoading,
    createNewChat,
    switchToChat,
    removeChatById,
    saveChatMessages,
    refreshChats: loadChats
  };
} 