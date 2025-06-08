import { fetch } from 'expo/fetch';
import { Annotation } from '../types/chat';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini';

export interface ChatMessageContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | ChatMessageContentPart[];
}

export async function sendChatMessage(
  messages: ChatMessage[],
  model: string = OPENAI_MODEL,
  webSearch: boolean = false
) {
  const filteredMessages = messages.filter(
    (m) =>
      (typeof m.content === "string" && m.content.trim() !== "") ||
      (Array.isArray(m.content) && m.content.length > 0)
  );
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: filteredMessages,
        response_format: {
          type: 'text'
        },
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0]?.message?.content || '',
      annotations: [],
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get response from AI');
  }
}

export async function sendChatMessageStream(
  messages: ChatMessage[],
  model: string = OPENAI_MODEL,
  webSearch: boolean = false,
  onChunk?: (chunk: string) => void,
  onAnnotations?: (annotations: Annotation[]) => void
) {
  const filteredMessages = messages.filter(
    (m) =>
      (typeof m.content === "string" && m.content.trim() !== "") ||
      (Array.isArray(m.content) && m.content.length > 0)
  );

  if (webSearch) {
    return sendWebSearchMessage(messages, model, onChunk, onAnnotations);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: filteredMessages,
        response_format: {
          type: 'text'
        },
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const choice = parsed.choices[0];
            if (choice?.delta?.content) {
              const content = choice.delta.content;
              fullResponse += content;
              onChunk?.(content);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }

    return { text: fullResponse, annotations: [] };
  } catch (error) {
    console.error('OpenAI API Stream Error:', error);
    throw new Error('Failed to get streaming response from AI');
  }
}

async function sendWebSearchMessage(
  messages: ChatMessage[],
  model: string = OPENAI_MODEL,
  onChunk?: (chunk: string) => void,
  onAnnotations?: (annotations: Annotation[]) => void
) {
  const lastUserMessage = messages.findLast((m) => m.role === 'user');
  if (!lastUserMessage) {
    throw new Error('No user message found to perform web search');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        tools: [{ "type": "web_search_preview" }],
        input: lastUserMessage.content,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const message = data.output.find((o: any) => o.type === 'message');
    
    if (message && message.content.length > 0) {
      const textContent = message.content.find((c: any) => c.type === 'output_text');
      if (textContent) {
        onChunk?.(textContent.text);
        if (textContent.annotations) {
          const apiAnnotations = textContent.annotations;
          const chatAnnotations: Annotation[] = apiAnnotations.map((a: any) => ({
            start_index: a.start_index,
            end_index: a.end_index,
            citation: {
              url: a.url,
              title: a.title,
            },
          }));
          onAnnotations?.(chatAnnotations);
          return { text: textContent.text, annotations: chatAnnotations };
        }
        return { text: textContent.text, annotations: [] };
      }
    }
    
    return { text: '', annotations: [] };
  } catch (error) {
    console.error('OpenAI Web Search API Error:', error);
    throw new Error('Failed to get response from AI web search');
  }
}