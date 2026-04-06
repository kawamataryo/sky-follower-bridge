import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UserGroupCard } from "~/components/UserGroupCard";
import { useAuth } from "~/contexts/AuthContext";
import { useScan } from "~/contexts/ScanContext";
import type { BskyUser } from "~/types";
import { colors, radius, spacing, typography } from "~/lib/theme";

type UserGroup = {
  key: string;
  users: BskyUser[];
};

export default function ResultsScreen() {
  const router = useRouter();
  const { agent } = useAuth();
  const { matchedUsers, reset } = useScan();

  // Group users by originalHandle
  const groups = useMemo<UserGroup[]>(() => {
    const map = new Map<string, BskyUser[]>();
    for (const user of matchedUsers) {
      const key = user.originalHandle || user.did;
      const existing = map.get(key);
      if (existing) {
        existing.push(user);
      } else {
        map.set(key, [user]);
      }
    }
    return Array.from(map.entries()).map(([key, users]) => ({ key, users }));
  }, [matchedUsers]);

  const handleFollow = useCallback(
    async (user: BskyUser) => {
      if (!agent) return;
      await agent.follow(user.did);
    },
    [agent],
  );

  const handleScanAgain = () => {
    reset();
    router.replace("/x-login-guide");
  };

  const renderItem = useCallback(
    ({ item }: { item: UserGroup }) => (
      <UserGroupCard users={item.users} onFollow={handleFollow} />
    ),
    [handleFollow],
  );

  return (
    <LinearGradient colors={[...colors.gradient.aurora]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {matchedUsers.length} users found
        </Text>
        {groups.length !== matchedUsers.length && (
          <Text style={styles.subtitle}>
            {groups.length} X accounts matched
          </Text>
        )}
        <View style={styles.accentLine} />
      </View>

      <FlatList
        data={groups}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No matches found</Text>
            <Text style={styles.emptyText}>
              We couldn't find any matching Bluesky accounts.
            </Text>
          </View>
        }
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={handleScanAgain}
          activeOpacity={0.85}
        >
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  accentLine: {
    height: 3,
    width: 40,
    backgroundColor: colors.accent.cyan,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  list: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  scanAgainButton: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  scanAgainText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
});
