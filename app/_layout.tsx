import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Drawer>
            <Drawer.Screen
              name="index"
              options={{
                drawerLabel: "Chat",
                title: "Chat",
                headerShown: false,
              }}
            />
            <Drawer.Screen
              name="chats"
              options={{
                drawerLabel: "Histórico de Chats",
                title: "Chats",
                headerShown: true,
              }}
            />
            <Drawer.Screen
              name="(history)"
              options={{
                drawerItemStyle: { display: "none" },
                headerShown: false,
              }}
            />
          </Drawer>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
