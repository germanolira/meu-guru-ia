import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';
import {
  ChatMessage,
  sendChatMessage,
  sendChatMessageStream,
} from '../lib/openrouter';
import { Annotation, Message } from '../types/chat';

export interface SendMessageParams {
  messages: Message[];
  model?: string;
  streaming?: boolean;
  onStreamChunk?: (chunk: string) => void;
  onStreamAnnotations?: (annotations: Annotation[]) => void;
  webSearch?: boolean;
}

const SYSTEM_PROMPT = `Você é Guru IA, um assistente educacional inteligente especializado em ajudar estudantes brasileiros com suas dúvidas acadêmicas.

INSTRUÇÕES IMPORTANTES SOBRE LATEX:
- SEMPRE use LaTeX para fórmulas matemáticas, equações, expressões algébricas ou símbolos matemáticos
- Use $$formula$$ para fórmulas em bloco (centralizadas e destacadas)
- Use $formula$ para fórmulas inline (dentro do texto)
- Exemplos obrigatórios:
  * Para frações: $\\frac{1}{2}$ ou $$\\frac{a}{b}$$
  * Para integrais: $$\\int_{-\\infty}^{\\infty} f(x) dx$$
  * Para raízes: $\\sqrt{x}$ ou $\\sqrt[n]{x}$
  * Para potências: $x^2$ ou $a^{n}$
  * Para somatórios: $$\\sum_{i=1}^{n} x_i$$
  * Para limites: $$\\lim_{x \\to \\infty} f(x)$$
  * Para derivadas: $\\frac{df}{dx}$ ou $f'(x)$

OUTRAS INSTRUÇÕES:
- Seja didático e explique passo a passo
- Use linguagem clara e acessível para estudantes brasileiros
- Forneça exemplos práticos sempre que possível
- Quando explicar conceitos matemáticos, sempre use LaTeX para as fórmulas

NUNCA escreva matemática sem LaTeX. Sempre use a sintaxe LaTeX apropriada.`;

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messages,
      model,
      streaming,
      onStreamChunk,
      onStreamAnnotations,
      webSearch,
    }: SendMessageParams) => {
      const chatMessages: ChatMessage[] = await Promise.all(
        messages
          .filter(
            (msg) =>
              msg.role !== 'system' ||
              msg.text !==
                'Bem-vindo! Experimente enviar uma mensagem para ver as animações.'
          )
          .map(async (msg): Promise<ChatMessage> => {
            let content: ChatMessage["content"] = msg.text;

            if (msg.imageUri) {
              try {
                const base64 = await FileSystem.readAsStringAsync(msg.imageUri, {
                  encoding: FileSystem.EncodingType.Base64,
                });

                const imageUrl = `data:image/jpeg;base64,${base64}`;

                content = [
                  { type: "text", text: msg.text },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUrl,
                    },
                  },
                ];
              } catch (error) {
                console.error("Error reading image file:", error);
              }
            }

            return {
              role: msg.isUser ? 'user' : 'assistant',
              content,
            };
          })
      );

      const messagesWithSystemPrompt: ChatMessage[] = [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...chatMessages,
      ];

      if (streaming) {
        return await sendChatMessageStream(
          messagesWithSystemPrompt,
          model,
          webSearch,
          onStreamChunk,
          onStreamAnnotations
        );
      } else {
        return await sendChatMessage(messagesWithSystemPrompt, model, webSearch);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat'] });
    },
    onError: (error) => {},
  });
}

export function useChatHistory() {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}