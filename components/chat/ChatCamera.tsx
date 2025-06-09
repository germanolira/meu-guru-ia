import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChatCameraProps {
  onPictureTaken: (imageUri: string) => void;
  onClose: () => void;
}

export function ChatCamera({ onPictureTaken, onClose }: ChatCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 px-6">
        <View className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 max-w-sm w-full">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-violet-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="camera" size={32} color="#8b5cf6" />
            </View>
            <Text className="text-center text-gray-800 text-xl font-bold mb-2">
              Acesso à Câmera
            </Text>
            <Text className="text-center text-gray-600 text-base leading-6">
              Precisamos da sua permissão para usar a câmera e capturar imagens
            </Text>
          </View>

          <TouchableOpacity
            onPress={requestPermission}
            className="bg-violet-500 rounded-2xl py-4 px-6 shadow-lg"
            style={{
              shadowColor: "#8b5cf6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white font-bold text-center text-lg">
              Permitir Acesso à Câmera
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  async function takePicture() {
    if (!cameraRef.current) {
      Alert.alert("Erro", "Câmera não está pronta. Tente novamente.");
      return;
    }

    if (isCapturing) {
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo && photo.uri) {
        onPictureTaken(photo.uri);
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível capturar a foto. Tente novamente."
        );
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        "Falha ao capturar foto. Verifique as permissões da câmera."
      );
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <CameraView
        className="flex-1"
        facing="back"
        ref={cameraRef}
        style={{ flex: 1 }}
        onCameraReady={() => {}}
        onMountError={() => {}}
      />

      <View className="absolute top-0 left-0 right-0 z-10">
        <SafeAreaView edges={["top"]}>
          <View className="bg-gradient-to-b from-black/60 to-transparent pt-4 pb-8">
            <View className="flex-row justify-between items-center px-6">
              <Text className="text-white font-bold text-2xl">Meu Guru</Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View className="absolute bottom-0 left-0 right-0 z-10">
        <SafeAreaView edges={["bottom"]}>
          <View className="bg-gradient-to-t from-black/60 to-transparent pt-8 pb-8">
            <View className="items-center px-8">
              <TouchableOpacity
                className={`items-center justify-center mb-6 ${
                  isCapturing ? "opacity-50" : ""
                }`}
                onPress={takePicture}
                disabled={isCapturing}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <View className="w-20 h-20 rounded-full bg-white border-4 border-gray-200 items-center justify-center">
                  <View className="w-16 h-16 rounded-full bg-violet-500 items-center justify-center">
                    <Ionicons
                      name={isCapturing ? "time" : "camera"}
                      size={28}
                      color="white"
                    />
                  </View>
                </View>
              </TouchableOpacity>

              <Text className="text-white text-center text-base font-medium">
                {isCapturing ? "Capturando..." : "Toque no botão para capturar"}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}
