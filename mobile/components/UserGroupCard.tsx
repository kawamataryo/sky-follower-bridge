import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { BskyUser } from "~/types";
import { colors, radius, spacing, typography } from "~/lib/theme";

type Props = {
  users: BskyUser[];
  onFollow: (user: BskyUser) => Promise<void>;
};

const MATCH_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  handle: { label: "Handle match", color: colors.match.handle },
  display_name: { label: "Display name", color: colors.match.display_name },
  description: { label: "Bio match", color: colors.match.description },
};

function SingleUserRow({
  user,
  onFollow,
}: { user: BskyUser; onFollow: (user: BskyUser) => Promise<void> }) {
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
      style={styles.userRow}
      onPress={() => router.push({ pathname: "/profile", params: { did: user.did } })}
      activeOpacity={0.7}
    >
      {user.avatar ? (
        <Image source={{ uri: user.avatar }} style={[styles.avatar, styles.bskyAvatar]} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.displayName} numberOfLines={1}>
          {user.displayName || user.handle}
        </Text>
        <Text style={styles.handle} numberOfLines={1}>
          @{user.handle}
        </Text>
        {matchInfo && (
          <View style={[styles.badge, { backgroundColor: matchInfo.color + "20" }]}>
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
          onPress={(e) => {
            e.stopPropagation();
            handleFollow();
          }}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[...colors.gradient.button]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.followButtonGradient}
          >
            <Text style={styles.followButtonText}>{isLoading ? "..." : "Follow"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export function UserGroupCard({ users, onFollow }: Props) {
  const [expanded, setExpanded] = useState(false);
  const first = users[0];
  const isSingle = users.length === 1;

  if (isSingle) {
    // Single match — render as a normal card (delegate to SingleUserRow with original avatar)
    const router = useRouter();
    const user = first;
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
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={[styles.avatar, styles.bskyAvatar]} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.displayName} numberOfLines={1}>
            {user.displayName || user.handle}
          </Text>
          <Text style={styles.handle} numberOfLines={1}>@{user.handle}</Text>
          {matchInfo && (
            <View style={[styles.badge, { backgroundColor: matchInfo.color + "20" }]}>
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
            onPress={(e) => {
              e.stopPropagation();
              handleFollow();
            }}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[...colors.gradient.button]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.followButtonGradient}
            >
              <Text style={styles.followButtonText}>{isLoading ? "..." : "Follow"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  // Multiple matches — grouped card
  return (
    <View style={styles.groupContainer}>
      <TouchableOpacity
        style={styles.groupHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        {/* Original avatar */}
        <View style={styles.avatarRow}>
          {first.originalAvatar ? (
            <Image source={{ uri: first.originalAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]} />
          )}
          <Text style={styles.arrow}>→</Text>
          {/* Stacked Bluesky avatars */}
          <View style={styles.stackedAvatars}>
            {users.slice(0, 3).map((u, i) => (
              <Image
                key={u.did}
                source={{ uri: u.avatar }}
                style={[
                  styles.avatar,
                  styles.bskyAvatar,
                  styles.stackedAvatar,
                  { marginLeft: i === 0 ? 0 : -14, zIndex: 3 - i },
                ]}
              />
            ))}
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.displayName} numberOfLines={1}>
            {first.originalDisplayName || first.originalHandle}
          </Text>
          <Text style={styles.handle} numberOfLines={1}>
            {users.length} matches found
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.text.secondary}
        />
      </TouchableOpacity>

      {/* Expanded list */}
      {expanded && (
        <View style={styles.expandedList}>
          {users.map((u) => (
            <SingleUserRow key={u.did} user={u} onFollow={onFollow} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
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
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  stackedAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  stackedAvatar: {
    borderWidth: 2,
    borderColor: colors.bg.primary,
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
  expandedList: {
    marginTop: spacing.sm,
    marginLeft: spacing.lg,
    borderLeftWidth: 2,
    borderLeftColor: colors.border.accent,
    paddingLeft: spacing.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    paddingLeft: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: spacing.md,
  },
});
