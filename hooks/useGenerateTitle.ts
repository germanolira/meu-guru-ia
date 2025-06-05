import { generateChatTitle } from '../lib/storage';
import { useSendMessage } from './useChatAPI';

export function useGenerateTitle() {
  const sendMessageMutation = useSendMessage();

  const generateTitleFromBot = async (firstUserMessage: string, botResponse: string): Promise<string> => {
    try {
      const titlePrompt = `Com base nesta conversa entre usuário e assistente, gere um título curto e descritivo (máximo 5 palavras) que capture o tema principal:

Usuário: ${firstUserMessage}
Assistente: ${botResponse}

Responda apenas com o título, sem aspas ou explicações:`;

      const response = await sendMessageMutation.mutateAsync({
        messages: [{ id: 'temp', text: titlePrompt, isUser: true, timestamp: new Date(), role: 'user' }],
        model: "meta-llama/llama-3.3-8b-instruct:free",
        streaming: false,
      });

      return response?.trim() || generateChatTitle(firstUserMessage);
    } catch (error) {
      console.error('Erro ao gerar título com bot:', error);
      return generateChatTitle(firstUserMessage);
    }
  };

  return {
    generateTitle: (firstMessage: string) => generateChatTitle(firstMessage),
    generateTitleFromBot
  };
} 