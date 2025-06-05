import {
  LegendList,
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list";
import React from "react";
import { View } from "react-native";
import { Message } from "../../types/chat";
import { ChatMessage } from "./ChatMessage";

interface ChatMessageListProps {
  messages: Message[];
}

export const ChatMessageList = React.forwardRef(function ChatMessageList(
  { messages }: ChatMessageListProps,
  ref: React.Ref<LegendListRef>
) {
  const renderMessage = ({ item }: LegendListRenderItemProps<Message>) => {
    return <ChatMessage message={item} />;
  };

  return (
    <View className="flex-1 px-4">
      <LegendList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        recycleItems={true}
        maintainVisibleContentPosition
        ref={ref}
        className="py-2"
      />
    </View>
  );
});

ChatMessageList.displayName = "ChatMessageList";
