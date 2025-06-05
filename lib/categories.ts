export const categoryEmojis: Record<string, string> = {
  'Trabalho': '💼',
  'Estudo': '📚',
  'Tecnologia': '💻',
  'Saúde': '🏥',
  'Culinária': '🍳',
  'Entretenimento': '🎬',
  'Viagem': '✈️',
  'Finanças': '💰',
  'Relacionamento': '💙',
  'Criatividade': '🎨',
  'Outros': '💭'
};

export function getCategoryEmoji(category: string): string {
  return categoryEmojis[category] || categoryEmojis['Outros'];
}

export function groupChatsByCategory(chats: any[]): Record<string, any[]> {
  return chats.reduce((groups, chat) => {
    const category = chat.category || 'Outros';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(chat);
    return groups;
  }, {} as Record<string, any[]>);
} 