import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';

export const useCopyText = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyText = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setIsCopied(true);
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying text:', error);
    }
  };

  return {
    copyText,
    isCopied,
  };
}; 