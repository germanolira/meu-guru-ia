import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function MateriaisScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleGoBack = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleGoForward = () => {
    if (webViewRef.current) {
      webViewRef.current.goForward();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200 pt-10">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 mx-4 bg-gray-50 rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-4">
        <WebView
          ref={webViewRef}
          source={{ uri: "https://www.meuguru.com/search" }}
          style={{ flex: 1, width: width - 32, height: height - 100 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            setCanGoForward(navState.canGoForward);
          }}
        />
      </View>
      <View className="flex-row justify-center items-center mb-4">
        <TouchableOpacity
          onPress={handleGoBack}
          disabled={!canGoBack}
          className={`px-4 py-3 rounded-xl self-center mr-2 ${
            canGoBack ? "bg-violet-500" : "bg-gray-400"
          }`}
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGoForward}
          disabled={!canGoForward}
          className={`px-4 py-3 rounded-xl self-center mr-2 ${
            canGoForward ? "bg-violet-500" : "bg-gray-400"
          }`}
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleClose}
          className="flex-row items-center justify-center bg-violet-500 px-6 py-3 rounded-xl self-center"
          style={{
            shadowColor: "#6366f1",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <Ionicons name="close" size={24} color="white" />
          <Text className="text-white font-semibold ml-2">Fechar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
