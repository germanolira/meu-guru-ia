import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { LegendListRef } from "@legendapp/list";
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { Message } from "../types/chat";

const ChatScreen = () => {
  const listRef = useRef<LegendListRef | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "2",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "3",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "4",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "5",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "6",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "7",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "8",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "9",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "10",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: "11",
      text: "Olá! Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");

      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);

      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Obrigado pela sua mensagem! Como posso ajudar mais?",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);

        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ChatHeader title="Meu Guru IA" />

        <ChatMessageList messages={messages} ref={listRef} />

        <ChatInput
          inputText={inputText}
          onChangeText={setInputText}
          onSendMessage={sendMessage}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
