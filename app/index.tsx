import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { useSendMessage } from "@/hooks/useChatAPI";
import { LegendListRef } from "@legendapp/list";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import { Alert, Keyboard, Platform, SafeAreaView } from "react-native";
import { Message } from "../types/chat";

const initialMessages: Message[] = [];

function ChatScreen() {
  const navigation = useNavigation();
  const listRef = useRef<LegendListRef | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [chatInputHeight, setChatInputHeight] = useState(
    Platform.OS === "ios" ? 88 : 70
  );
  const [isBotThinkingGlobal, setIsBotThinkingGlobal] = useState(false);
  const thinkingMessageIdRef = useRef<string | null>(null);
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

    setMessages((prevMessages) => {
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
      const contextMessages = [...messages, userMessage];

      const response = await sendMessageMutation.mutateAsync({
        messages: contextMessages,
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        streaming: false,
      });

      const botReply: Message = {
        id: `bot-${Date.now()}`,
        text: response || "Desculpe, não consegui gerar uma resposta.",
        isUser: false,
        timestamp: new Date(),
        role: "assistant",
        isThinking: false,
      };

      setMessages((prevMessages) => {
        let newMessages = [...prevMessages];
        if (thinkingMessageIdRef.current) {
          const thinkingIndex = newMessages.findIndex(
            (msg) => msg.id === thinkingMessageIdRef.current
          );
          if (thinkingIndex !== -1) {
            newMessages.splice(thinkingIndex, 1, botReply);
          } else {
            newMessages = [
              ...newMessages.filter(
                (msg) => msg.id !== thinkingMessageIdRef.current
              ),
              botReply,
            ];
          }
          thinkingMessageIdRef.current = null;
        } else {
          newMessages = [...newMessages, botReply];
        }
        return newMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove thinking indicator and show error
      setMessages((prevMessages) => {
        const newMessages = prevMessages.filter(
          (msg) => msg.id !== thinkingMessageIdRef.current
        );
        thinkingMessageIdRef.current = null;
        return newMessages;
      });

      Alert.alert(
        "Erro",
        "Não foi possível enviar a mensagem. Verifique sua conexão e tente novamente.",
        [{ text: "OK" }]
      );
    }
  }, [inputText, sendMessageMutation, messages]);

  const handleChatInputLayout = useCallback(
    (event: any) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && height !== chatInputHeight) {
        setChatInputHeight(height);
      }
    },
    [chatInputHeight]
  );

  return (
    <React.Fragment>
      <SafeAreaView className="flex-1 bg-gray-100">
        <StatusBar style="auto" />
        <ChatHeader
          title="Meu Guru IA"
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />

        <ChatMessageList
          messages={messages}
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
      />
    </React.Fragment>
  );
}

export default ChatScreen;
