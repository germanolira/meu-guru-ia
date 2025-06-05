import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getCategoryEmoji } from '../../lib/categories';

interface CategoryCardProps {
  category: string;
  count: number;
  onPress: () => void;
}

export function CategoryCard({ category, count, onPress }: CategoryCardProps) {
  const emoji = getCategoryEmoji(category);
  
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 m-2 shadow-sm border border-gray-100 min-h-[100px] flex-1"
      onPress={onPress}
      style={{ 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
      }}
    >
      <View className="flex-1 justify-between">
        <View className="bg-gray-50 w-12 h-12 rounded-full items-center justify-center mb-3">
          <Text className="text-2xl">{emoji}</Text>
        </View>
        
        <View>
          <Text className="text-gray-900 font-semibold text-base mb-1" numberOfLines={1}>
            {category}
          </Text>
          <Text className="text-gray-500 text-sm">
            {count} {count === 1 ? 'chat' : 'chats'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
} 