export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isThinking?: boolean;
  isStreaming?: boolean;
  isLastUserMessage?: boolean;
  role?: 'user' | 'assistant' | 'system';
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}