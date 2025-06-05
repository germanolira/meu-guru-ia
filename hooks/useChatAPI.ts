import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatMessage, sendChatMessage, sendChatMessageStream } from '../lib/openrouter';
import { Message } from '../types/chat';

export interface SendMessageParams {
  messages: Message[];
  model?: string;
  streaming?: boolean;
  onStreamChunk?: (chunk: string) => void;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messages, model, streaming, onStreamChunk }: SendMessageParams) => {
      // Convert app messages to OpenRouter format
      const chatMessages: ChatMessage[] = messages
        .filter(msg => msg.role !== 'system' || msg.text !== 'Bem-vindo! Experimente enviar uma mensagem para ver as animações.')
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
        }));

      if (streaming) {
        return await sendChatMessageStream(chatMessages, model, onStreamChunk);
      } else {
        return await sendChatMessage(chatMessages, model);
      }
    },
    onSuccess: () => {
      // Invalidate any cached chat data if needed
      queryClient.invalidateQueries({ queryKey: ['chat'] });
    },
    onError: (error) => {
      console.error('Chat API Error:', error);
    },
  });
}

export function useChatHistory() {
  // This could be extended to fetch chat history from a backend
  // For now, we'll manage state locally in the component
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}