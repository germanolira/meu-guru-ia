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
      queryClient.invalidateQueries({ queryKey: ['chat'] });
    },
    onError: (error) => {
    },
  });
}

export function useChatHistory() {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}