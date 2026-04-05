import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UserCard } from "~/components/UserCard";
import { useAuth } from "~/contexts/AuthContext";
import { useScan } from "~/contexts/ScanContext";
import type { BskyUser } from "~/types";
import { colors, radius, spacing, typography } from "~/lib/theme";

export default function ResultsScreen() {
  const router = useRouter();
  const { agent } = useAuth();
  const { matchedUsers, reset } = useScan();

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
    ({ item }: { item: BskyUser }) => (
      <UserCard user={item} onFollow={handleFollow} />
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
        <View style={styles.accentLine} />
      </View>

      <FlatList
        data={matchedUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.did}
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
  accentLine: {
    height: 3,
    width: 40,
    backgroundColor: colors.accent.cyan,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  list: {
    flexGrow: 1,
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
