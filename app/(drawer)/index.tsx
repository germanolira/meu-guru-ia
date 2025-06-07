import { ChatCamera } from "@/components/chat/ChatCamera";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { useChat } from "@/hooks/useChat";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function ChatScreen() {
  const { isLoading } = useProtectedRoute();
  const navigation = useNavigation();
  const listRef = useRef<FlatList | null>(null);
  const [inputText, setInputText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [chatInputHeight, setChatInputHeight] = useState(
    Platform.OS === "ios" ? 88 : 70
  );

  const {
    currentMessages,
    isBotThinkingGlobal,
    isSearchMode,
    hasUserSentMessage,
    canShowNewQuestion,
    handleToggleThinkingMode,
    handleToggleSearchMode,
    sendMessage,
    handleNewChat,
  } = useChat();

  const handleSendMessage = () => {
    sendMessage(inputText, setInputText, imageUri);
    setImageUri(null);
  };

  const newChatHandler = () => {
    handleNewChat(setInputText);
  };

  const handleAttachmentPress = () => {
    setIsCameraOpen(true);
  };

  const handleCameraClose = () => {
    setIsCameraOpen(false);
  };

  const handlePictureTaken = (uri: string) => {
    setImageUri(uri);
    setIsCameraOpen(false);
  };

  const handleChatInputLayout = useCallback(
    (event: any) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && height !== chatInputHeight) {
        setChatInputHeight(height);
      }
    },
    [chatInputHeight]
  );

  useEffect(() => {
    const lastMessage = currentMessages[currentMessages.length - 1];
    if (lastMessage && (lastMessage.isStreaming || lastMessage.isThinking)) {
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  }, [currentMessages]);

  if (isLoading) {
    return null;
  }

  return (
    <React.Fragment>
      <SafeAreaView className="flex-1 bg-gray-100" edges={["left", "right"]}>
        <StatusBar style="auto" />
        <ChatHeader
          title="Meu Guru IA"
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          onNewChatPress={newChatHandler}
        />

        <ChatMessageList
          messages={currentMessages}
          ref={listRef}
          chatInputHeight={chatInputHeight}
        />
        {imageUri && (
          <View className="p-4 bg-gray-200">
            <View className="relative">
              <Image
                source={{ uri: imageUri }}
                className="w-24 h-24 rounded-lg"
              />
              <TouchableOpacity
                onPress={() => setImageUri(null)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
              >
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
      <ChatInput
        inputText={inputText}
        onChangeText={setInputText}
        onSendMessage={handleSendMessage}
        onLayoutContainer={handleChatInputLayout}
        onToggleThinkingMode={handleToggleThinkingMode}
        isThinkingActive={isBotThinkingGlobal}
        onToggleSearchMode={handleToggleSearchMode}
        isSearchMode={isSearchMode}
        hasUserSentMessage={hasUserSentMessage}
        canShowNewQuestion={canShowNewQuestion}
        onNewQuestion={newChatHandler}
        onAttachmentPress={handleAttachmentPress}
      />
      <Modal
        visible={isCameraOpen}
        animationType="slide"
        onRequestClose={handleCameraClose}
      >
        <ChatCamera
          onPictureTaken={handlePictureTaken}
          onClose={handleCameraClose}
        />
      </Modal>
    </React.Fragment>
  );
}

export default ChatScreen;
