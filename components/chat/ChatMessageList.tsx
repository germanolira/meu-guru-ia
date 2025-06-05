import { LegendList, LegendListRef } from "@legendapp/list";
import React, { forwardRef, useCallback } from "react";
import { Keyboard, View } from "react-native";
import { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
import { Message } from "../../types/chat";
import { ChatMessage } from "./ChatMessage";

interface ChatMessageListProps {
  messages: Message[];
  chatInputHeight?: number;
}

export const ChatMessageList = forwardRef<LegendListRef, ChatMessageListProps>(
  ({ messages, chatInputHeight = 70 }, ref) => {
    const keyboard = useAnimatedKeyboard();

    const animatedFlatListPadding = useAnimatedStyle(() => {
      const padding = keyboard.height.value + chatInputHeight + 10;
      return {
        paddingBottom: padding,
      };
    }, [chatInputHeight]);

    const renderItem = useCallback(
      ({ item }: { item: Message }) => <ChatMessage message={item} />,
      []
    );

    return (
      <View className="flex-1">
        <LegendList
          ref={ref}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { paddingHorizontal: 16, paddingTop: 20, flexGrow: 1 },
            animatedFlatListPadding,
          ]}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          invertStickyHeaders
        />
      </View>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";
