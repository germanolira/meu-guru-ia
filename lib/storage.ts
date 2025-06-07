import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat } from '../types/chat';

const CHATS_KEY = 'chats';

export async function getChats(): Promise<Chat[]> {
  const json = await AsyncStorage.getItem(CHATS_KEY);
  if (!json) return [];
  
  const chats = JSON.parse(json);
  return chats.map((chat: any) => ({
    ...chat,
    category: chat.category || 'Outros',
    isFavorite: chat.isFavorite || false,
    messages: chat.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  }));
}

export async function getFavoriteChats(): Promise<Chat[]> {
  const chats = await getChats();
  return chats.filter(chat => chat.isFavorite);
}

export async function toggleChatFavorite(chatId: string): Promise<void> {
  const chats = await getChats();
  const chatIndex = chats.findIndex(c => c.id === chatId);
  
  if (chatIndex > -1) {
    chats[chatIndex].isFavorite = !chats[chatIndex].isFavorite;
    await saveChats(chats);
  }
}

export async function saveChats(chats: Chat[]): Promise<void> {
  await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export async function addOrUpdateChat(chat: Chat): Promise<void> {
  const chats = await getChats();
  
  const idx = chats.findIndex(c => c.id === chat.id);
  if (idx > -1) {
    chats[idx] = chat;
  } else {
    chats.push(chat);
  }
  
  await saveChats(chats);
}

export async function getChatById(id: string): Promise<Chat | undefined> {
  const chats = await getChats();
  
  const chat = chats.find(c => c.id === id);
  if (!chat) {
    return undefined;
  }
  
  return {
    ...chat,
    messages: chat.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  };
}

export async function deleteChat(id: string): Promise<void> {
  const chats = await getChats();
  const filtered = chats.filter(c => c.id !== id);
  await saveChats(filtered);
}

export function generateChatTitle(firstMessage: string): string {
  const words = firstMessage.trim().split(' ');
  return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
}

export async function testAsyncStorage(): Promise<void> {
  try {
    await AsyncStorage.setItem('test_key', JSON.stringify({ test: 'value', timestamp: Date.now() }));
    
    const testResult = await AsyncStorage.getItem('test_key');
    
    await AsyncStorage.removeItem('test_key');
  } catch (error) {
  }
} 