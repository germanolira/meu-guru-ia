import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface ChatInputProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSendMessage: () => void;
}

export function ChatInput({
  inputText,
  onChangeText,
  onSendMessage,
}: ChatInputProps) {
  return (
    <View className="flex-row px-4 py-3 items-end">
      <TextInput
        className="flex-1 border border-gray-200 rounded-3xl px-4 py-3 mr-3 max-h-24 text-base bg-gray-50"
        value={inputText}
        onChangeText={onChangeText}
        placeholder="Digite sua mensagem..."
        placeholderTextColor="#999"
        multiline
        maxLength={500}
        onSubmitEditing={onSendMessage}
      />
      <TouchableOpacity
        className={`px-5 py-3 rounded-3xl justify-center items-center ${
          inputText.trim() ? "bg-blue-500" : "bg-gray-300"
        }`}
        onPress={onSendMessage}
        disabled={!inputText.trim()}
      >
        <Text
          className={`text-base font-semibold ${
            inputText.trim() ? "text-white" : "text-gray-500"
          }`}
        >
          Enviar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
