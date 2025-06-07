export interface Annotation {
  start_index: number;
  end_index: number;
  citation: {
    url: string;
    title: string;
  };
}

export interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUri?: string;
  isThinking?: boolean;
  isStreaming?: boolean;
  isLastUserMessage?: boolean;
  role?: 'user' | 'assistant' | 'system';
  annotations?: Annotation[];
  isSearching?: boolean;
  searchCompleted?: boolean;
  searchSummary?: string;
  searchSources?: SearchSource[];
}

export interface Chat {
  id: string;
  title: string;
  category: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
}