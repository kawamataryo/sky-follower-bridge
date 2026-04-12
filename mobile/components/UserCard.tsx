import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { BskyUser } from "~/types";
import { colors, radius, spacing, typography } from "~/lib/theme";

const BSKY_DEFAULT_AVATAR_URI =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJub25lIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iIzAwNzBmZiI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTIiIGN5PSI5LjUiIHI9IjMuNSIgZmlsbD0iI2ZmZiI+PC9jaXJjbGU+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSIjZmZmIiBkPSJNIDEyLjA1OCAyMi43ODQgQyA5LjQyMiAyMi43ODQgNy4wMDcgMjEuODM2IDUuMTM3IDIwLjI2MiBDIDUuNjY3IDE3Ljk4OCA4LjUzNCAxNi4yNSAxMS45OSAxNi4yNSBDIDE1LjQ5NCAxNi4yNSAxOC4zOTEgMTguMDM2IDE4Ljg2NCAyMC4zNTcgQyAxNy4wMSAyMS44NzQgMTQuNjQgMjIuNzg0IDEyLjA1OCAyMi43ODQgWiI+PC9wYXRoPjwvc3ZnPg==";

type Props = {
  user: BskyUser;
  onFollow: (user: BskyUser) => Promise<void>;
};

const MATCH_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  handle: { label: "Handle match", color: colors.match.handle },
  display_name: { label: "Display name", color: colors.match.display_name },
  description: { label: "Bio match", color: colors.match.description },
};

export function UserCard({ user, onFollow }: Props) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const matchInfo = MATCH_TYPE_LABELS[user.matchType];

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await onFollow(user);
      setIsFollowing(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Follow failed";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push({ pathname: "/profile", params: { did: user.did } })}
      activeOpacity={0.7}
    >
      <View style={styles.avatarRow}>
        {user.originalAvatar ? (
          <Image source={{ uri: user.originalAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}
        <Text style={styles.arrow}>→</Text>
        <Image
          source={{ uri: user.avatar || BSKY_DEFAULT_AVATAR_URI }}
          style={[styles.avatar, styles.bskyAvatar]}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.displayName} numberOfLines={1}>
          {user.displayName || user.handle}
        </Text>
        <Text style={styles.handle} numberOfLines={1}>
          @{user.handle}
        </Text>
        {matchInfo && (
          <View
            style={[styles.badge, { backgroundColor: matchInfo.color + "20" }]}
          >
            <Text style={[styles.badgeText, { color: matchInfo.color }]}>
              {matchInfo.label}
            </Text>
          </View>
        )}
      </View>

      {isFollowing ? (
        <View style={styles.followingButton}>
          <Text style={styles.followingButtonText}>Following</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.followButton, isLoading && styles.loadingButton]}
          onPress={handleFollow}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[...colors.gradient.button]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.followButtonGradient}
          >
            <Text style={styles.followButtonText}>
              {isLoading ? "..." : "Follow"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bskyAvatar: {
    borderWidth: 2,
    borderColor: colors.accent.cyan,
  },
  avatarPlaceholder: {
    backgroundColor: colors.bg.cardHover,
  },
  arrow: {
    marginHorizontal: spacing.xs,
    color: colors.accent.cyan,
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.bold,
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
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
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  badgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semibold,
  },
  followButton: {
    borderRadius: radius.full,
    overflow: "hidden",
  },
  followButtonGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  loadingButton: {
    opacity: 0.6,
  },
  followButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.semibold,
  },
  followingButton: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  followingButtonText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.medium,
  },
});
