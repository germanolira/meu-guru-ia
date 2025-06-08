import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LatexRenderer } from "./LatexRendererWrapper";

const mathExamples = [
  {
    title: "Quadratic Formula",
    inline: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    block: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
  },
  {
    title: "Integral",
    inline: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}",
    block: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}",
  },
  {
    title: "Summation",
    inline: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
    block: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
  },
  {
    title: "Matrix",
    inline: "A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
    block: "A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
  },
  {
    title: "Limit",
    inline: "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
    block: "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
  },
];

export function LatexExample() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [isBlock, setIsBlock] = useState(false);

  const currentExample = mathExamples[selectedExample];

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Expo DOM LaTeX Renderer
      </Text>

      <Text className="text-gray-600 mb-6 text-center">
        This demonstrates LaTeX rendering using Expo DOM instead of WebView
      </Text>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          Select Example:
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {mathExamples.map((example, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedExample(index)}
              className={`px-3 py-2 rounded-lg ${
                selectedExample === index ? "bg-purple-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  selectedExample === index
                    ? "text-white font-medium"
                    : "text-gray-700"
                }`}
              >
                {example.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          Display Mode:
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setIsBlock(false)}
            className={`px-4 py-2 rounded-lg ${
              !isBlock ? "bg-purple-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`${
                !isBlock ? "text-white font-medium" : "text-gray-700"
              }`}
            >
              Inline
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIsBlock(true)}
            className={`px-4 py-2 rounded-lg ${
              isBlock ? "bg-purple-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`${
                isBlock ? "text-white font-medium" : "text-gray-700"
              }`}
            >
              Block
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          LaTeX Source:
        </Text>
        <View className="bg-gray-100 p-3 rounded-lg">
          <Text className="font-mono text-sm text-gray-800">
            {isBlock
              ? `$$${currentExample.block}$$`
              : `$${currentExample.inline}$`}
          </Text>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          Rendered Output:
        </Text>
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <LatexRenderer isBlock={isBlock} isUser={false}>
            {isBlock ? currentExample.block : currentExample.inline}
          </LatexRenderer>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          In User Message:
        </Text>
        <View className="items-end">
          <View className="bg-purple-500 px-4 py-3 rounded-2xl rounded-br-md max-w-[80%]">
            <LatexRenderer isBlock={isBlock} isUser={true}>
              {isBlock ? currentExample.block : currentExample.inline}
            </LatexRenderer>
          </View>
        </View>
      </View>

      <View className="bg-green-50 p-4 rounded-lg border border-green-200">
        <Text className="text-lg font-semibold text-green-800 mb-2">
          Benefits of Expo DOM:
        </Text>
        <Text className="text-green-700 text-sm leading-relaxed">
          • Better performance than WebView{"\n"}• Shared JavaScript context
          {"\n"}• Easier debugging and development{"\n"}• Native-like
          integration{"\n"}• Supports both mobile and web platforms{"\n"}• Hot
          reload and fast refresh support
        </Text>
      </View>
    </ScrollView>
  );
}
