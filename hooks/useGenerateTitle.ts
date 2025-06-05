import { generateChatTitle } from '../lib/storage';
import { useSendMessage } from './useChatAPI';

interface TitleAndCategory {
  title: string;
  category: string;
}

export function useGenerateTitle() {
  const sendMessageMutation = useSendMessage();

  const generateTitleAndCategoryFromBot = async (firstUserMessage: string, botResponse: string): Promise<TitleAndCategory> => {
    try {
      const titlePrompt = `Com base nesta conversa entre usuário e assistente, gere um título curto (máximo 4 palavras) e uma categoria que capture o tema principal.

Usuário: ${firstUserMessage}
Assistente: ${botResponse}

Responda APENAS em formato JSON válido seguindo este exemplo:
{"title": "Receita de Bolo", "category": "Culinária"}

Categorias possíveis: Trabalho, Estudo, Tecnologia, Saúde, Culinária, Entretenimento, Viagem, Finanças, Relacionamento, Criatividade, Outros

JSON:`;

      const response = await sendMessageMutation.mutateAsync({
        messages: [{ id: 'temp', text: titlePrompt, isUser: true, timestamp: new Date(), role: 'user' }],
        model: "meta-llama/llama-3.3-8b-instruct:free",
        streaming: false,
      });

      try {
        const parsed = JSON.parse(response?.trim() || '{}');
        if (parsed.title && parsed.category) {
          return {
            title: parsed.title,
            category: parsed.category
          };
        }
      } catch (parseError) {
        console.log('Erro ao fazer parse do JSON, usando fallback');
      }

      // Fallback se JSON inválido
      return {
        title: generateChatTitle(firstUserMessage),
        category: 'Outros'
      };
    } catch (error) {
      console.error('Erro ao gerar título com bot:', error);
      return {
        title: generateChatTitle(firstUserMessage),
        category: 'Outros'
      };
    }
  };

  return {
    generateTitle: (firstMessage: string) => generateChatTitle(firstMessage),
    generateTitleAndCategoryFromBot
  };
} 