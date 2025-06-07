import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ChatCameraProps {
  onPictureTaken: (imageUri: string) => void;
  onClose: () => void;
}

export function ChatCamera({ onPictureTaken, onClose }: ChatCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 px-6">
        <View className="bg-white rounded-2xl p-8 shadow-lg">
          <Text className="text-center mb-6 text-gray-800 text-lg font-medium">
            Precisamos da sua permissão para usar a câmera
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-blue-500 rounded-xl py-4 px-6"
          >
            <Text className="text-white font-semibold text-center">
              Permitir Acesso à Câmera
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        onPictureTaken(photo.uri);
      }
    }
  }

  return (
    <View className="flex-1">
      <CameraView
        className="flex-1"
        facing="back"
        ref={cameraRef}
        style={{ flex: 1 }}
      />

      <View className="absolute top-16 left-0 right-0 flex-row justify-between items-center px-6">
        <Text className="text-white font-bold text-2xl">Meu Guru</Text>
        <TouchableOpacity onPress={onClose} className="p-3">
          <Text className="text-white font-bold text-xl">✕</Text>
        </TouchableOpacity>
      </View>

      <View className="absolute bottom-12 left-0 right-0 px-8 items-center">
        <TouchableOpacity
          className="items-center justify-center"
          onPress={takePicture}
        >
          <View className="w-24 h-24 rounded-full bg-white border-4 border-gray-200 shadow-2xl items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-gray-100" />
          </View>
        </TouchableOpacity>

        <Text className="text-white text-center mt-4 text-sm">
          Toque no botão para tirar foto
        </Text>
      </View>
    </View>
  );
}
