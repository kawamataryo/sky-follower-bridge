import type { AppBskyActorDefs } from "@atproto/api";
import { sendToBackground } from "@plasmohq/messaging";
import { useCallback, useRef, useState } from "react";
import type { AuthMethod } from "./useAuth";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

interface UseTypeaheadSearchProps {
  identifier: string;
  setIdentifier: (value: string) => void;
  onLogin: (identifierOverride: string) => void;
  authMethod: AuthMethod;
}

export const useTypeaheadSearch = ({
  identifier,
  setIdentifier,
  onLogin,
  authMethod,
}: UseTypeaheadSearchProps) => {
  const [suggestions, setSuggestions] = useState<
    AppBskyActorDefs.ProfileViewBasic[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestCounterRef = useRef(0);

  const search = useCallback(async (query: string) => {
    const requestId = ++requestCounterRef.current;
    setIsSearching(true);
    try {
      const { actors, error } = await sendToBackground({
        name: "searchActorsTypeahead",
        body: { q: query, limit: 8 },
      });
      if (requestId !== requestCounterRef.current) return;
      if (error) {
        setSuggestions([]);
        return;
      }
      setSuggestions(actors || []);
      setShowDropdown(true);
    } catch {
      if (requestId === requestCounterRef.current) {
        setSuggestions([]);
      }
    } finally {
      if (requestId === requestCounterRef.current) {
        setIsSearching(false);
      }
    }
  }, []);

  const onInputChange = useCallback(
    (value: string) => {
      setIdentifier(value);
      setActiveIndex(-1);

      if (authMethod !== "oauth") return;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (value.length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);
      debounceRef.current = setTimeout(() => {
        search(value);
      }, DEBOUNCE_MS);
    },
    [authMethod, setIdentifier, search],
  );

  const onSelect = useCallback(
    (handle: string) => {
      setIdentifier(handle);
      setShowDropdown(false);
      setSuggestions([]);
      onLogin(handle);
    },
    [setIdentifier, onLogin],
  );

  const onClose = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const onFocus = useCallback(() => {
    if (
      authMethod === "oauth" &&
      suggestions.length > 0 &&
      identifier.length >= MIN_QUERY_LENGTH
    ) {
      setShowDropdown(true);
    }
  }, [authMethod, suggestions.length, identifier.length]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (authMethod !== "oauth" || !showDropdown) return;

      const isDown = e.key === "ArrowDown" || (e.ctrlKey && e.key === "n");
      const isUp = e.key === "ArrowUp" || (e.ctrlKey && e.key === "p");

      if (isDown) {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
      } else if (isUp) {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
      }

      switch (e.key) {
        case "Enter":
          if (activeIndex >= 0 && activeIndex < suggestions.length) {
            e.preventDefault();
            onSelect(suggestions[activeIndex].handle);
          }
          break;
        case "Escape":
          setShowDropdown(false);
          setActiveIndex(-1);
          break;
      }
    },
    [authMethod, showDropdown, suggestions, activeIndex, onSelect],
  );

  if (authMethod !== "oauth") {
    return {
      suggestions: [] as AppBskyActorDefs.ProfileViewBasic[],
      isSearching: false,
      showDropdown: false,
      activeIndex: -1,
      onInputChange: (value: string) => setIdentifier(value),
      onSelect: () => {},
      onClose: () => {},
      onFocus: () => {},
      onKeyDown: () => {},
    };
  }

  return {
    suggestions,
    isSearching,
    showDropdown,
    activeIndex,
    onInputChange,
    onSelect,
    onClose,
    onFocus,
    onKeyDown,
  };
};
