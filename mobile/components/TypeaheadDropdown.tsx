import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BSKY_DOMAIN } from "~/lib/constants";
import { colors, radius, spacing, typography } from "~/lib/theme";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const SEARCH_LIMIT = 8;

type Actor = {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
};

type Props = {
  query: string;
  visible: boolean;
  onSelect: (handle: string) => void;
};

async function searchActors(q: string): Promise<Actor[]> {
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead?q=${encodeURIComponent(q)}&limit=${SEARCH_LIMIT}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.actors ?? [];
  } catch {
    return [];
  }
}

export function TypeaheadDropdown({ query, visible, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<Actor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestCounterRef = useRef(0);

  useEffect(() => {
    if (!visible || query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestCounterRef.current;
      try {
        const actors = await searchActors(query);
        if (requestId === requestCounterRef.current) {
          setSuggestions(actors);
        }
      } catch {
        if (requestId === requestCounterRef.current) {
          setSuggestions([]);
        }
      } finally {
        if (requestId === requestCounterRef.current) {
          setIsSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, visible]);

  if (!visible || (query.length < MIN_QUERY_LENGTH && suggestions.length === 0)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {isSearching && suggestions.length === 0 && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.accent.cyan} />
          </View>
        )}
        {suggestions.map((actor) => (
          <TouchableOpacity
            key={actor.did}
            style={styles.row}
            onPress={() => onSelect(actor.handle)}
            activeOpacity={0.7}
          >
            {actor.avatar ? (
              <Image source={{ uri: actor.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
            <View style={styles.info}>
              <Text style={styles.displayName} numberOfLines={1}>
                {actor.displayName || actor.handle}
              </Text>
              <Text style={styles.handle} numberOfLines={1}>
                @{actor.handle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {!isSearching && suggestions.length === 0 && query.length >= MIN_QUERY_LENGTH && (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No results</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    overflow: "hidden",
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
  list: {
    maxHeight: 220,
  },
  loadingRow: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    backgroundColor: colors.bg.cardHover,
  },
  info: {
    flex: 1,
    overflow: "hidden",
  },
  displayName: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  handle: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: 1,
  },
  emptyRow: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
  },
});
