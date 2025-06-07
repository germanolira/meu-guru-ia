import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Message } from "../../types/chat";
import { IconSymbol } from "../ui/IconSymbol";
import { ChatMessage } from "./ChatMessage";

interface SelectedAsset {
  uri: string;
  fileName: string | null;
}

interface ChatMessageListProps {
  messages: Message[];
  chatInputHeight?: number;
  onModeSelect?: (mode: "tutors" | "ai") => void;
  onLatexToggle?: (enabled: boolean) => void;
}

type ModeType = "none" | "tutors" | "ai";

const ConditionalIcon = ({
  name,
  size,
  color,
}: {
  name: string;
  size: number;
  color: string;
}) => {
  if (Platform.OS === "ios") {
    return <IconSymbol name={name as any} size={size} color={color} />;
  }

  const androidIconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    "person.fill": "person",
    person: "person-outline",
    "brain.fill": "bulb",
    brain: "bulb-outline",
    "paperplane.fill": "send",
  };

  const androidIconName = androidIconMap[name] || "help-outline";
  return <Ionicons name={androidIconName} size={size} color={color} />;
};

export const ChatMessageList = forwardRef<FlatList, ChatMessageListProps>(
  ({ messages, chatInputHeight = 70, onModeSelect, onLatexToggle }, ref) => {
    const [selectedMode, setSelectedMode] = useState<ModeType>("ai");
    const [latexEnabled, setLatexEnabled] = useState(false);
    const [selectedImages, setSelectedImages] = useState<SelectedAsset[]>([]);
    const keyboard = useAnimatedKeyboard();

    const contentOpacity = useSharedValue(0);
    const contentTranslateY = useSharedValue(20);
    const tutorsOpacity = useSharedValue(0);
    const tutorsTranslateY = useSharedValue(20);
    const aiOpacity = useSharedValue(0);
    const aiTranslateY = useSharedValue(20);

    useEffect(() => {
      contentOpacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
      contentTranslateY.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.back(1.1)),
      });
    }, []);

    useEffect(() => {
      if (selectedMode === "tutors") {
        tutorsOpacity.value = withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
        tutorsTranslateY.value = withTiming(0, {
          duration: 500,
          easing: Easing.out(Easing.back(1.1)),
        });
        aiOpacity.value = withTiming(0, { duration: 200 });
        aiTranslateY.value = withTiming(-10, { duration: 200 });
      } else if (selectedMode === "ai") {
        aiOpacity.value = withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
        aiTranslateY.value = withTiming(0, {
          duration: 500,
          easing: Easing.out(Easing.back(1.1)),
        });
        tutorsOpacity.value = withTiming(0, { duration: 200 });
        tutorsTranslateY.value = withTiming(-10, { duration: 200 });
      } else {
        tutorsOpacity.value = withTiming(0, { duration: 300 });
        tutorsTranslateY.value = withTiming(20, { duration: 300 });
        aiOpacity.value = withTiming(0, { duration: 300 });
        aiTranslateY.value = withTiming(20, { duration: 300 });
      }
    }, [selectedMode]);

    const animatedFlatListStyle = useAnimatedStyle(() => {
      return {
        paddingBottom:
          Math.max(keyboard.height.value, 0) + chatInputHeight + 100,
      };
    }, [chatInputHeight]);

    const animatedContentStyle = useAnimatedStyle(() => ({
      opacity: contentOpacity.value,
      transform: [{ translateY: contentTranslateY.value }],
    }));

    const animatedTutorsStyle = useAnimatedStyle(() => ({
      opacity: tutorsOpacity.value,
      transform: [{ translateY: tutorsTranslateY.value }],
    }));

    const animatedAiStyle = useAnimatedStyle(() => ({
      opacity: aiOpacity.value,
      transform: [{ translateY: aiTranslateY.value }],
    }));

    const animatedScrollViewStyle = useAnimatedStyle(() => ({
      paddingBottom: Math.max(keyboard.height.value, 0) + chatInputHeight + 10,
    }));

    const renderItem = useCallback(
      ({ item }: { item: Message }) => (
        <ChatMessage message={item} latexEnabled={latexEnabled} />
      ),
      [latexEnabled]
    );

    const handleModeSelect = (mode: "tutors" | "ai") => {
      setSelectedMode(mode);
      onModeSelect?.(mode);
    };

    const handleLatexToggle = (enabled: boolean) => {
      setLatexEnabled(enabled);
      onLatexToggle?.(enabled);
    };

    const handleImagePick = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Desculpe, precisamos de permissão para acessar suas fotos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 2,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImages(
          result.assets.map(({ uri, fileName }) => ({
            uri,
            fileName: fileName ?? null,
          }))
        );
      }
    };

    const removeImage = (uri: string) => {
      setSelectedImages((prevImages) =>
        prevImages.filter((image) => image.uri !== uri)
      );
    };

    const renderEmptyState = () => (
      <Pressable onPress={Keyboard.dismiss} className="flex-1">
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ flexGrow: 1 }, animatedScrollViewStyle]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={animatedContentStyle} className="px-8 pt-12">
            <Text className="text-violet-600 text-2xl font-semibold text-center mb-8">
              Como precisa resolver a tarefa?
            </Text>

            <View className="flex-row gap-4">
              <Pressable
                onPress={() => handleModeSelect("tutors")}
                className={`flex-1 bg-white ${
                  selectedMode === "tutors" ? "bg-violet-100" : ""
                } rounded-2xl p-4 flex-row items-center justify-center border border-gray-200`}
              >
                <ConditionalIcon
                  name={selectedMode === "tutors" ? "person.fill" : "person"}
                  size={24}
                  color={selectedMode === "tutors" ? "#8b5cf6" : "#6b7280"}
                />
                <Text
                  className={`ml-3 font-semibold ${
                    selectedMode === "tutors"
                      ? "text-violet-600"
                      : "text-gray-600"
                  }`}
                >
                  Tutores
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleModeSelect("ai")}
                className={`flex-1 bg-white ${
                  selectedMode === "ai" ? "bg-violet-100" : ""
                } rounded-2xl p-4 flex-row items-center justify-center border border-gray-200`}
              >
                <ConditionalIcon
                  name={selectedMode === "ai" ? "brain.fill" : "brain"}
                  size={24}
                  color={selectedMode === "ai" ? "#8b5cf6" : "#6b7280"}
                />
                <Text
                  className={`ml-3 font-semibold ${
                    selectedMode === "ai" ? "text-violet-600" : "text-gray-600"
                  }`}
                >
                  Guru IA
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          <View className="px-8 pt-6">
            <Animated.View style={animatedAiStyle}>
              <Text className="text-violet-600 text-xl font-semibold text-center mb-2">
                Descreva sua dúvida
              </Text>
              <Text className="text-gray-500 text-center mb-2">
                Digite sua pergunta e nossa IA irá te ajudar
              </Text>
              <View className="bg-indigo-50 rounded-xl p-3 mb-4 border border-indigo-200">
                <View className="flex-row items-center justify-center mb-1">
                  <Ionicons name="camera" size={16} color="#6366f1" />
                  <Text className="text-indigo-700 font-medium ml-2 text-sm">
                    📸 Anexe fotos das suas tarefas
                  </Text>
                </View>
                <Text className="text-indigo-600 text-xs text-center">
                  Clique no ícone da câmera no campo de texto para tirar foto ou
                  selecionar da galeria
                </Text>
              </View>

              <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-gray-700 font-medium">
                      Suporte LaTeX
                    </Text>
                  </View>
                  <Switch
                    value={latexEnabled}
                    onValueChange={handleLatexToggle}
                    trackColor={{ false: "#d1d5db", true: "#c4b5fd" }}
                    thumbColor={latexEnabled ? "#8b5cf6" : "#f3f4f6"}
                  />
                </View>

                {latexEnabled && (
                  <View className="pt-2 border-t border-gray-200">
                    <Text className="text-orange-600 text-xs font-medium mb-1">
                      ⚠️ Modo Debug Ativo
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      Performance pode estar comprometida. Funcionalidade pode
                      ser investigada e otimizada.
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>

            <Animated.View style={animatedTutorsStyle}>
              {selectedImages.length === 0 ? (
                <>
                  <Text className="text-violet-600 text-xl font-semibold text-center mb-2">
                    Envie as atividades que devem ser resolvidas
                  </Text>
                  <Text className="text-gray-500 text-center mb-6">
                    Anexe os arquivos para um tutor resolver
                  </Text>

                  <Pressable
                    onPress={handleImagePick}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-6 items-center bg-gray-50"
                  >
                    <ConditionalIcon
                      name="paperplane.fill"
                      size={40}
                      color="#9ca3af"
                    />
                    <Text className="text-gray-600 font-medium mt-3 text-center">
                      Toque para anexar arquivos
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1 text-center">
                      PDF, DOC, JPG, PNG
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text className="text-violet-600 text-lg font-semibold text-center mb-3">
                    Arquivos selecionados ({selectedImages.length}/2)
                  </Text>

                  <View className="flex-row flex-wrap">
                    {selectedImages.map((item) => (
                      <View key={item.uri} className="w-1/2 p-1">
                        <View className="relative">
                          <Image
                            source={{ uri: item.uri }}
                            className="w-full h-24 rounded-lg bg-gray-200"
                          />
                          <Pressable
                            onPress={() => removeImage(item.uri)}
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full items-center justify-center w-5 h-5"
                          >
                            <Ionicons name="close" size={12} color="white" />
                          </Pressable>
                        </View>
                        <Text
                          className="mt-1 text-xs text-gray-700 text-center"
                          numberOfLines={1}
                        >
                          {item.fileName || "Imagem"}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {selectedImages.length < 2 && (
                    <Pressable
                      onPress={handleImagePick}
                      className="border-2 border-dashed border-violet-300 rounded-lg p-3 items-center bg-violet-50 mt-3"
                    >
                      <Ionicons name="add" size={20} color="#8b5cf6" />
                      <Text className="text-violet-600 font-medium mt-1 text-center text-sm">
                        Adicionar mais imagens
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </Animated.View>
          </View>
        </Animated.ScrollView>
      </Pressable>
    );

    if (messages.length === 0) {
      return renderEmptyState();
    }

    return (
      <Animated.FlatList
        ref={ref}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[
          {
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 100,
          },
          animatedFlatListStyle,
        ]}
        style={{ flex: 1 }}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";
