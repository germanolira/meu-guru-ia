import { ChatCamera } from "@/components/chat/ChatCamera";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { useChat } from "@/hooks/useChat";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

function ChatScreen() {
  const { isLoading } = useProtectedRoute();
  const navigation = useNavigation();
  const listRef = React.useRef<FlatList | null>(null);

  const [inputText, setInputText] = React.useState("");
  const [imageUri, setImageUri] = React.useState<string | null>(null);

  const [showCamera, setShowCamera] = React.useState(false);
  const cameraAnimation = useSharedValue(0);

  const [chatInputHeight, setChatInputHeight] = React.useState(
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

  const safeSetShowCamera = React.useCallback(
    (value: boolean) => {
      try {
        setShowCamera(value);
      } catch (error) {
        console.error("Error in safeSetShowCamera:", error);
      }
    },
    [setShowCamera]
  );

  const handleSendMessage = () => {
    sendMessage(inputText, setInputText, imageUri);
    setImageUri(null);
  };

  const newChatHandler = () => {
    handleNewChat(setInputText);
  };

  const handleAttachmentPress = () => {
    try {
      safeSetShowCamera(true);
      cameraAnimation.value = withTiming(1, { duration: 300 });
    } catch (error) {
      console.error("Error in handleAttachmentPress:", error);
    }
  };

  const handleCameraClose = () => {
    try {
      cameraAnimation.value = withTiming(0, { duration: 300 });

      setTimeout(() => {
        safeSetShowCamera(false);
      }, 300);
    } catch (error) {
      console.error("Error in handleCameraClose:", error);
    }
  };

  const handlePictureTaken = (uri: string) => {
    try {
      setImageUri(uri);
      handleCameraClose();
    } catch (error) {
      console.error("Error in handlePictureTaken:", error);
    }
  };

  const handleChatInputLayout = React.useCallback(
    (event: any) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && height !== chatInputHeight) {
        setChatInputHeight(height);
      }
    },
    [chatInputHeight]
  );

  const cameraStyle = useAnimatedStyle(() => {
    return {
      opacity: cameraAnimation.value,
      transform: [
        {
          translateY: (1 - cameraAnimation.value) * 1000,
        },
      ],
    };
  });

  React.useEffect(() => {
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
          <View className="p-4 bg-white border-t border-gray-200">
            <View className="relative bg-gray-100 rounded-xl p-2">
              <Text className="text-sm text-gray-600 mb-2 font-medium">
                Imagem selecionada:
              </Text>
              <View className="relative">
                <Image
                  source={{ uri: imageUri }}
                  className="w-32 h-32 rounded-lg bg-gray-300"
                  onLoadStart={() => {}}
                  onLoad={() => {}}
                  onError={(error) => {
                    console.error("Image load error:", error.nativeEvent.error);
                    Alert.alert("Erro", "Não foi possível carregar a imagem");
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => {
                    setImageUri(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 shadow-lg"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
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
      {showCamera && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
            },
            cameraStyle,
          ]}
        >
          <ChatCamera
            onPictureTaken={handlePictureTaken}
            onClose={handleCameraClose}
          />
        </Animated.View>
      )}
    </React.Fragment>
  );
}

export default ChatScreen;
