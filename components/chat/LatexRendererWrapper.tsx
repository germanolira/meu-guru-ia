import React, { useRef } from "react";
import { Platform, View } from "react-native";
import LatexDOMComponent, { type LatexDOMRef } from "./LatexRenderer";
import LatexWebComponent from "./LatexRendererWeb";

interface LatexRendererProps {
  children: string;
  style?: any;
  isUser?: boolean;
  isBlock?: boolean;
}

const IS_WEB = Platform.OS === "web";

export function LatexRenderer({
  children,
  style,
  isUser = false,
  isBlock = false,
}: LatexRendererProps) {
  const domRef = useRef<LatexDOMRef>(null);

  const LatexComponent = IS_WEB ? LatexWebComponent : LatexDOMComponent;

  return (
    <View
      style={[
        {
          height: isBlock ? 60 : 40,
          marginVertical: 4,
          borderRadius: 8,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <LatexComponent
        ref={domRef}
        content={children}
        isUser={isUser}
        isBlock={isBlock}
        dom={{
          style: { flex: 1, backgroundColor: "transparent" },
          scrollEnabled: false,
        }}
      />
    </View>
  );
}
