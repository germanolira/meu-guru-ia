import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TTSOptions {
  model?: string;
  voice?: string;
  speed?: number;
}

const DEFAULT_OPTIONS: TTSOptions = {
  model: 'gpt-4o-mini-tts',
  voice: 'coral',
  speed: 1.0,
};

export const useTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState<{ uri: string } | null>(null);
  const audioFileRef = useRef<string | null>(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);

  const cleanup = useCallback(async () => {
    if (audioFileRef.current) {
      try {
        await FileSystem.deleteAsync(audioFileRef.current, { idempotent: true });
      } catch (error) {
        console.log('Error deleting temp audio file:', error);
      }
      audioFileRef.current = null;
    }
    setAudioSource(null);
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (text: string, options: TTSOptions = {}) => {
    if (isPlaying || isLoading) return;

    try {
      setIsLoading(true);
      
      await cleanup();

      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found');
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || DEFAULT_OPTIONS.model,
          input: text,
          voice: options.voice || DEFAULT_OPTIONS.voice,
          response_format: 'mp3',
          speed: options.speed || DEFAULT_OPTIONS.speed,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate speech: ${response.status} - ${errorText}`);
      }

      const audioArrayBuffer = await response.arrayBuffer();

      if (audioArrayBuffer.byteLength === 0) {
        throw new Error('Audio buffer vazio recebido da OpenAI');
      }

      const uint8Array = new Uint8Array(audioArrayBuffer);
      let binaryString = '';
      const chunkSize = 1024;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      
      const audioBase64 = btoa(binaryString);
      const tempFileName = `tts_${Date.now()}.mp3`;
      const tempFilePath = `${FileSystem.cacheDirectory}${tempFileName}`;
      
      await FileSystem.writeAsStringAsync(tempFilePath, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      audioFileRef.current = tempFilePath;
      
      setShouldPlay(true);
      setAudioSource({ uri: tempFilePath });
      setIsLoading(false);

    } catch (error) {
      setIsLoading(false);
      setIsPlaying(false);
      await cleanup();
    }
  }, [isPlaying, isLoading, cleanup]);

  useEffect(() => {
    if (shouldPlay && status.isLoaded) {
      try {
        player.play();
      } catch (error) {
        cleanup();
      } finally {
        setShouldPlay(false);
      }
    }
  }, [shouldPlay, status.isLoaded, player, cleanup]);

  useEffect(() => {
    if (status.isLoaded) {
      if (status.playing) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  }, [status.isLoaded, status.playing]);

  const stop = useCallback(async () => {
    if (isPlaying && player) {
      try {
        await player.pause();
        setIsPlaying(false);
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
    await cleanup();
  }, [cleanup, isPlaying, player]);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
  };
}; 