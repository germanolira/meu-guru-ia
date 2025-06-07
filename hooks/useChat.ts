import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Keyboard } from "react-native";

import { Annotation, Message } from "../types/chat";
import { useSendMessage } from "./useChatAPI";
import { useChatStorage } from "./useChatStorage";

const USE_OPENAI = process.env.EXPO_PUBLIC_USE_OPENAI === 'true';
const OPENROUTER_MODEL = 'openai/gpt-4o-mini';
const OPENAI_MODEL = 'gpt-4o-mini';
const defaultModel = USE_OPENAI ? OPENAI_MODEL : OPENROUTER_MODEL;

export function useChat() {
  const {
    currentMessages,
    currentChatId,
    createNewChat,
    saveChatMessages,
    setCurrentMessages,
  } = useChatStorage();

  const [isBotThinkingGlobal, setIsBotThinkingGlobal] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [canShowNewQuestion, setCanShowNewQuestion] = useState(false);

  const thinkingMessageIdRef = useRef<string | null>(null);
  const searchingMessageIdRef = useRef<string | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);

  const sendMessageMutation = useSendMessage();

  const handleToggleThinkingMode = useCallback(() => {
    setIsBotThinkingGlobal((prev) => !prev);
  }, []);

  const handleToggleSearchMode = useCallback(() => {
    setIsSearchMode((prev) => !prev);
  }, []);

  const sendMessage = useCallback(
    async (
      inputText: string,
      setInputText: (text: string) => void,
      imageUri?: string | null
    ) => {
      if ((!inputText.trim() && !imageUri) || sendMessageMutation.isPending)
        return;

      const userMsgId = `user-${Date.now()}`;
      const userMessage: Message = {
        id: userMsgId,
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date(),
        role: "user",
        isLastUserMessage: true,
        imageUri: imageUri || undefined,
      };

      setHasUserSentMessage(true);
      setCanShowNewQuestion(false);

      setCurrentMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) =>
          msg.role === "user" && msg.isLastUserMessage
            ? { ...msg, isLastUserMessage: false }
            : msg
        );
        let newMessages = [...updatedMessages, userMessage];

        if (isSearchMode) {
          searchingMessageIdRef.current = `bot-searching-${Date.now()}`;
          const searchingMsg: Message = {
            id: searchingMessageIdRef.current,
            text: "Pesquisando na web...",
            isUser: false,
            timestamp: new Date(),
            role: "assistant",
            isSearching: true,
          };
          newMessages = [...newMessages, searchingMsg];
        }

        thinkingMessageIdRef.current = `bot-thinking-${Date.now()}`;
        const thinkingMsg: Message = {
          id: thinkingMessageIdRef.current,
          text: "",
          isUser: false,
          timestamp: new Date(),
          role: "assistant",
          isThinking: true,
        };
        newMessages = [...newMessages, thinkingMsg];
        return newMessages;
      });

      setInputText("");
      Keyboard.dismiss();

      try {
        const contextMessages = [...currentMessages, userMessage];

        streamingMessageIdRef.current = `bot-streaming-${Date.now()}`;
        let accumulatedAnnotations: Annotation[] = [];

        const streamingMsg: Message = {
          id: streamingMessageIdRef.current,
          text: "",
          isUser: false,
          timestamp: new Date(),
          role: "assistant",
          isStreaming: true,
        };

        setCurrentMessages((prevMessages) => {
          const newMessages = prevMessages.filter(
            (msg) =>
              msg.id !== thinkingMessageIdRef.current &&
              msg.id !== searchingMessageIdRef.current
          );
          return [...newMessages, streamingMsg];
        });

        let accumulatedText = "";
        const response = await sendMessageMutation.mutateAsync({
          messages: contextMessages,
          model: defaultModel,
          streaming: true,
          webSearch: isSearchMode,
          onStreamChunk: (chunk: string) => {
            accumulatedText += chunk;
            setCurrentMessages((prevMessages) => {
              return prevMessages.map((msg) =>
                msg.id === streamingMessageIdRef.current
                  ? { ...msg, text: accumulatedText }
                  : msg
              );
            });
          },
          onStreamAnnotations: (annotations: Annotation[]) => {
            accumulatedAnnotations.push(...annotations);
            setCurrentMessages((prevMessages) => {
              return prevMessages.map((msg) =>
                msg.id === streamingMessageIdRef.current
                  ? { ...msg, annotations: [...accumulatedAnnotations] }
                  : msg
              );
            });
          },
        });

        const botReply: Message = {
          id: `bot-${Date.now()}`,
          text:
            accumulatedText ||
            response.text ||
            "Desculpe, não consegui gerar uma resposta.",
          isUser: false,
          timestamp: new Date(),
          role: "assistant",
          isStreaming: false,
          annotations: response.annotations,
        };

        setCurrentMessages((prevMessages) => {
          const newMessages = prevMessages.filter(
            (msg) => msg.id !== streamingMessageIdRef.current
          );
          const finalMessages = [...newMessages, botReply];
          setCanShowNewQuestion(true);

          if (currentChatId) {
            saveChatMessages(finalMessages);
          }

          return finalMessages;
        });
      } catch (error) {
        console.error("Error sending message:", error);

        setCurrentMessages((prevMessages) => {
          const newMessages = prevMessages.filter(
            (msg) => msg.id !== streamingMessageIdRef.current
          );
          streamingMessageIdRef.current = null;
          setCanShowNewQuestion(true);
          return newMessages;
        });

        Alert.alert(
          "Erro",
          "Não foi possível enviar a mensagem. Verifique sua conexão e tente novamente.",
          [{ text: "OK" }]
        );
      }
    },
    [
      sendMessageMutation,
      currentMessages,
      isSearchMode,
      currentChatId,
      saveChatMessages,
      setCurrentMessages,
    ]
  );

  const handleNewChat = useCallback(
    (setInputText: (text: string) => void) => {
      createNewChat();
      setCurrentMessages([]);
      setInputText("");
      setHasUserSentMessage(false);
      setCanShowNewQuestion(false);
      setIsBotThinkingGlobal(false);
      setIsSearchMode(false);
    },
    [createNewChat, setCurrentMessages]
  );

  useEffect(() => {
    if (currentMessages.length > 0) {
      const hasUserMessage = currentMessages.some((msg) => msg.isUser);
      const lastMessage = currentMessages[currentMessages.length - 1];
      const isBotLastMessage =
        lastMessage &&
        !lastMessage.isUser &&
        !lastMessage.isThinking &&
        !lastMessage.isStreaming;

      setHasUserSentMessage(hasUserMessage);
      setCanShowNewQuestion(hasUserMessage && isBotLastMessage);
    } else {
      setHasUserSentMessage(false);
      setCanShowNewQuestion(false);
    }
  }, [currentMessages]);

  useEffect(() => {
    if (!currentChatId) {
      createNewChat();
    }
  }, [currentChatId, createNewChat]);

  return {
    currentMessages,
    isBotThinkingGlobal,
    isSearchMode,
    hasUserSentMessage,
    canShowNewQuestion,
    handleToggleThinkingMode,
    handleToggleSearchMode,
    sendMessage,
    handleNewChat,
  };
} 