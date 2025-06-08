import { Drawer } from "expo-router/drawer";
import React from "react";
import { DrawerContent } from "../../components/navigation/DrawerContent";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
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
          drawerLabel: "Histórico",
          title: "Histórico de Chats",
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="onboarding"
        options={{
          drawerItemStyle: { display: "none" },
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="debug"
        options={{
          drawerLabel: "Debug",
          title: "Debug",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="materiais"
        options={{
          drawerLabel: "Materiais",
          title: "Materiais",
          headerShown: false,
        }}
      />
    </Drawer>
  );
}
