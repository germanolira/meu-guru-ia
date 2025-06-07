import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

interface LatexRendererProps {
  children: string;
  style?: any;
  isUser?: boolean;
  isBlock?: boolean;
}

export function LatexRenderer({
  children,
  style,
  isUser = false,
  isBlock = false,
}: LatexRendererProps) {
  const textColor = isUser ? "#FFFFFF" : "#1F2937";
  const backgroundColor = isUser ? "#8b5cf6" : "transparent";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
        <script>
          window.MathJax = {
            tex: {
              inlineMath: [['$', '$']],
              displayMath: [['$$', '$$']],
              processEscapes: true,
              processEnvironments: true
            },
            options: {
              skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
              ignoreHtmlClass: 'tex2jax_ignore',
              processHtmlClass: 'tex2jax_process'
            }
          };
        </script>
        <style>
          body {
            margin: 0;
            padding: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 16px;
            color: ${textColor};
            background-color: ${backgroundColor};
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 40px;
            overflow: hidden;
          }
          .math-container {
            text-align: ${isBlock ? "center" : "left"};
            width: 100%;
          }
          .MathJax {
            color: ${textColor} !important;
          }
          .MathJax_Display {
            margin: 4px 0 !important;
          }
        </style>
      </head>
      <body>
        <div class="math-container">
          ${isBlock ? `$$${children}$$` : `$${children}$`}
        </div>
      </body>
    </html>
  `;

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
      <WebView
        source={{ html }}
        style={{ flex: 1, backgroundColor: "transparent" }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}
