import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat } from '../types/chat';

const CHATS_KEY = 'chats';

export async function getChats(): Promise<Chat[]> {
  const json = await AsyncStorage.getItem(CHATS_KEY);
  if (!json) return [];
  
  const chats = JSON.parse(json);
  // Converter timestamps de volta para Date objects
  return chats.map((chat: Chat) => ({
    ...chat,
    messages: chat.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  }));
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
  if (!chat) return undefined;
  
  // Garantir que timestamps são Date objects
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