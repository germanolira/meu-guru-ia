import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { AnimatedArrow } from "./AnimatedArrow";
import { SearchCompletedIndicator } from "./SearchCompletedIndicator";
import { SearchSources } from "./SearchSources";
import { SearchSummary } from "./SearchSummary";
import { SearchingIndicator } from "./SearchingIndicator";

interface Source {
  title: string;
  url: string;
  snippet?: string;
}

interface SearchFlowProps {
  isSearching: boolean;
  searchCompleted: boolean;
  summary?: string;
  sources?: Source[];
  onSearchComplete?: () => void;
}

export function SearchFlow({
  isSearching,
  searchCompleted,
  summary,
  sources = [],
  onSearchComplete,
}: SearchFlowProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    if (searchCompleted && !showCompleted) {
      setShowCompleted(true);

      const summaryTimer = setTimeout(() => {
        setShowSummary(true);
      }, 1500);

      const sourcesTimer = setTimeout(() => {
        setShowSources(true);
        onSearchComplete?.();
      }, 2500);

      return () => {
        clearTimeout(summaryTimer);
        clearTimeout(sourcesTimer);
      };
    }
  }, [searchCompleted, showCompleted, onSearchComplete]);

  if (isSearching && !searchCompleted) {
    return (
      <View className="self-center my-3">
        <SearchingIndicator />
      </View>
    );
  }

  return (
    <View className="my-3">
      {showCompleted && (
        <View className="self-center mb-2">
          <SearchCompletedIndicator />
        </View>
      )}

      {showCompleted && showSummary && <AnimatedArrow />}

      {showSummary && summary && (
        <SearchSummary summary={summary} timestamp={new Date()} />
      )}

      {showSources && sources.length > 0 && <SearchSources sources={sources} />}
    </View>
  );
}
