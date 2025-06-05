import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { useSendMessage } from "@/hooks/useChatAPI";
import { useChatStorage } from "@/hooks/useChatStorage";
import { LegendListRef } from "@legendapp/list";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Keyboard, Platform, SafeAreaView } from "react-native";
import { Message } from "../types/chat";

function ChatScreen() {
  const navigation = useNavigation();
  const listRef = useRef<LegendListRef | null>(null);
  const {
    currentMessages,
    currentChatId,
    createNewChat,
    saveChatMessages,
    setCurrentMessages,
  } = useChatStorage();
  const [inputText, setInputText] = useState("");
  const [chatInputHeight, setChatInputHeight] = useState(
    Platform.OS === "ios" ? 88 : 70
  );
  const [isBotThinkingGlobal, setIsBotThinkingGlobal] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [canShowNewQuestion, setCanShowNewQuestion] = useState(false);
  const thinkingMessageIdRef = useRef<string | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const sendMessageMutation = useSendMessage();

  const handleToggleThinkingMode = useCallback(() => {
    setIsBotThinkingGlobal((prev) => !prev);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || sendMessageMutation.isPending) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      role: "user",
      isLastUserMessage: true,
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

    const currentInput = inputText.trim();
    setInputText("");
    Keyboard.dismiss();

    try {
      const contextMessages = [...currentMessages, userMessage];

      streamingMessageIdRef.current = `bot-streaming-${Date.now()}`;
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
          (msg) => msg.id !== thinkingMessageIdRef.current
        );
        return [...newMessages, streamingMsg];
      });

      let accumulatedText = "";
      const response = await sendMessageMutation.mutateAsync({
        messages: contextMessages,
        model: "meta-llama/llama-3.3-8b-instruct:free",
        streaming: true,
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
      });

      const botReply: Message = {
        id: `bot-${Date.now()}`,
        text: accumulatedText || response || "Desculpe, não consegui gerar uma resposta.",
        isUser: false,
        timestamp: new Date(),
        role: "assistant",
        isStreaming: false,
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
  }, [inputText, sendMessageMutation, currentMessages]);

  const handleChatInputLayout = useCallback(
    (event: any) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && height !== chatInputHeight) {
        setChatInputHeight(height);
      }
    },
    [chatInputHeight]
  );

  const handleNewQuestion = useCallback(() => {
    createNewChat();
    setCurrentMessages([]);
    setInputText("");
    setHasUserSentMessage(false);
    setCanShowNewQuestion(false);
    setIsBotThinkingGlobal(false);
  }, [createNewChat]);

  const handleNewChatFromHeader = useCallback(() => {
    createNewChat();
    setCurrentMessages([]);
    setInputText("");
    setHasUserSentMessage(false);
    setCanShowNewQuestion(false);
    setIsBotThinkingGlobal(false);
  }, [createNewChat]);

  useEffect(() => {
    // Atualizar estados baseados nas mensagens carregadas
    if (currentMessages.length > 0) {
      const hasUserMessage = currentMessages.some(msg => msg.isUser);
      const lastMessage = currentMessages[currentMessages.length - 1];
      const isBotLastMessage = lastMessage && !lastMessage.isUser && !lastMessage.isThinking && !lastMessage.isStreaming;
      
      setHasUserSentMessage(hasUserMessage);
      setCanShowNewQuestion(hasUserMessage && isBotLastMessage);
    } else {
      setHasUserSentMessage(false);
      setCanShowNewQuestion(false);
    }
  }, [currentMessages]);

  useEffect(() => {
    // Só criar um novo chat na inicialização se não houver chat atual
    if (!currentChatId) {
      createNewChat();
    }
  }, [currentChatId, createNewChat]);

  return (
    <React.Fragment>
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar style="auto" />
        <ChatHeader
          title="Meu Guru IA"
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          onNewChatPress={handleNewChatFromHeader}
        />

        <ChatMessageList
          messages={currentMessages}
          ref={listRef}
          chatInputHeight={chatInputHeight}
        />
      </SafeAreaView>
      <ChatInput
        inputText={inputText}
        onChangeText={setInputText}
        onSendMessage={sendMessage}
        onLayoutContainer={handleChatInputLayout}
        onToggleThinkingMode={handleToggleThinkingMode}
        isThinkingActive={isBotThinkingGlobal}
        hasUserSentMessage={hasUserSentMessage}
        canShowNewQuestion={canShowNewQuestion}
        onNewQuestion={handleNewQuestion}
      />
    </React.Fragment>
  );
}

export default ChatScreen;
