import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

const BSKY_DEFAULT_AVATAR_URI =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJub25lIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iIzAwNzBmZiI+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTIiIGN5PSI5LjUiIHI9IjMuNSIgZmlsbD0iI2ZmZiI+PC9jaXJjbGU+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSIjZmZmIiBkPSJNIDEyLjA1OCAyMi43ODQgQyA5LjQyMiAyMi43ODQgNy4wMDcgMjEuODM2IDUuMTM3IDIwLjI2MiBDIDUuNjY3IDE3Ljk4OCA4LjUzNCAxNi4yNSAxMS45OSAxNi4yNSBDIDE1LjQ5NCAxNi4yNSAxOC4zOTEgMTguMDM2IDE4Ljg2NCAyMC4zNTcgQyAxNy4wMSAyMS44NzQgMTQuNjQgMjIuNzg0IDEyLjA1OCAyMi43ODQgWiI+PC9wYXRoPjwvc3ZnPg==";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "~/contexts/AuthContext";
import { colors, radius, spacing, typography } from "~/lib/theme";

type ProfileData = {
  did: string;
  handle: string;
  displayName: string;
  description: string;
  avatar: string;
  banner: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  followUri: string | null;
};

type ExternalEmbed = {
  uri: string;
  title: string;
  description: string;
  thumb: string;
};

type FeedPost = {
  uri: string;
  cid: string;
  text: string;
  createdAt: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  images: string[];
  external: ExternalEmbed | null;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { did } = useLocalSearchParams<{ did: string }>();
  const { agent } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (!agent || !did) return;

    const fetchProfile = async () => {
      try {
        const [profileRes, feedRes] = await Promise.all([
          agent.getProfile({ actor: did }),
          agent.getAuthorFeed({ actor: did, limit: 10, filter: "posts_no_replies" }),
        ]);

        const p = profileRes.data;
        setProfile({
          did: p.did,
          handle: p.handle,
          displayName: p.displayName ?? "",
          description: p.description ?? "",
          avatar: p.avatar ?? "",
          banner: p.banner ?? "",
          followersCount: p.followersCount ?? 0,
          followsCount: p.followsCount ?? 0,
          postsCount: p.postsCount ?? 0,
          isFollowing: !!p.viewer?.following,
          isFollowedBy: !!p.viewer?.followedBy,
          followUri: p.viewer?.following ?? null,
        });

        const feedPosts: FeedPost[] = feedRes.data.feed
          .filter((item) => item.post.record && !item.reason)
          .map((item) => {
            const record = item.post.record as { text?: string; createdAt?: string };
            const images: string[] = [];
            let external: ExternalEmbed | null = null;
            const embed = item.post.embed;

            if (embed) {
              // Images
              if ("images" in embed && Array.isArray(embed.images)) {
                for (const img of embed.images) {
                  if (typeof img === "object" && img && "thumb" in img) {
                    images.push(img.thumb as string);
                  }
                }
              }

              // Extract external link from embed or nested media embed
              const extractExternal = (obj: unknown): ExternalEmbed | null => {
                if (!obj || typeof obj !== "object") return null;
                const e = obj as Record<string, unknown>;
                if (e.uri && typeof e.uri === "string") {
                  return {
                    uri: e.uri,
                    title: (e.title as string) ?? "",
                    description: (e.description as string) ?? "",
                    thumb: (e.thumb as string) ?? "",
                  };
                }
                return null;
              };

              if ("external" in embed && embed.external) {
                external = extractExternal(embed.external);
              }
              // recordWithMedia: external is nested under media.external
              if ("media" in embed && embed.media) {
                const media = embed.media as Record<string, unknown>;
                if ("external" in media && media.external) {
                  external = extractExternal(media.external);
                }
              }
            }

            return {
              uri: item.post.uri,
              cid: item.post.cid,
              text: record?.text ?? "",
              createdAt: record?.createdAt ?? "",
              likeCount: item.post.likeCount ?? 0,
              repostCount: item.post.repostCount ?? 0,
              replyCount: item.post.replyCount ?? 0,
              images,
              external,
            };
          });
        setPosts(feedPosts);
      } catch (e) {
        console.warn("Failed to fetch profile:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [agent, did]);

  const handleFollow = useCallback(async () => {
    if (!agent || !profile) return;
    setIsFollowLoading(true);
    try {
      if (profile.isFollowing && profile.followUri) {
        await agent.deleteFollow(profile.followUri);
        setProfile((prev) => prev ? { ...prev, isFollowing: false, followUri: null } : prev);
      } else {
        const res = await agent.follow(profile.did);
        setProfile((prev) => prev ? { ...prev, isFollowing: true, followUri: res.uri } : prev);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Operation failed";
      Alert.alert("Error", message);
    } finally {
      setIsFollowLoading(false);
    }
  }, [agent, profile]);

  const handleOpenInBsky = useCallback(() => {
    if (!profile) return;
    Linking.openURL(`https://bsky.app/profile/${profile.handle}`);
  }, [profile]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffH = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffH < 1) return `${Math.max(1, Math.floor(diffMs / (1000 * 60)))}m`;
      if (diffH < 24) return `${diffH}h`;
      const diffD = Math.floor(diffH / 24);
      if (diffD < 30) return `${diffD}d`;
      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  const renderPost = useCallback(
    ({ item }: { item: FeedPost }) => (
      <View style={styles.postCard}>
        {item.text ? <Text style={styles.postText}>{item.text}</Text> : null}

        {/* Images */}
        {item.images.length > 0 && (
          <View style={styles.postImages}>
            {item.images.slice(0, 4).map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.postImage} />
            ))}
          </View>
        )}

        {/* External link card */}
        {item.external && (
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL(item.external!.uri)}
            activeOpacity={0.7}
          >
            {item.external.thumb ? (
              <Image
                source={{ uri: item.external.thumb }}
                style={styles.linkThumb}
                resizeMode="cover"
              />
            ) : null}
            <View style={styles.linkContent}>
              {item.external.title ? (
                <Text style={styles.linkTitle} numberOfLines={2}>
                  {item.external.title}
                </Text>
              ) : null}
              {item.external.description ? (
                <Text style={styles.linkDescription} numberOfLines={2}>
                  {item.external.description}
                </Text>
              ) : null}
              <Text style={styles.linkUrl} numberOfLines={1}>
                {item.external.uri.replace(/^https?:\/\//, "")}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.postStats}>
          <View style={styles.postStatItem}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.postStat}>{item.replyCount}</Text>
          </View>
          <View style={styles.postStatItem}>
            <Ionicons name="repeat-outline" size={16} color={colors.text.tertiary} />
            <Text style={styles.postStat}>{item.repostCount}</Text>
          </View>
          <View style={styles.postStatItem}>
            <Ionicons name="heart-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.postStat}>{item.likeCount}</Text>
          </View>
          <Text style={styles.postStatMuted}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    ),
    [],
  );

  const renderHeader = useCallback(() => {
    if (!profile) return null;
    return (
      <View>
        {/* Banner */}
        {profile.banner ? (
          <Image source={{ uri: profile.banner }} style={styles.banner} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={[...colors.gradient.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          />
        )}

        {/* Avatar + Follow */}
        <View style={styles.avatarRow}>
          <Image
            source={{ uri: profile.avatar || BSKY_DEFAULT_AVATAR_URI }}
            style={styles.avatar}
          />
          <View style={styles.avatarActions}>
            <TouchableOpacity
              style={styles.openBskyButton}
              onPress={handleOpenInBsky}
              activeOpacity={0.7}
            >
              <Text style={styles.openBskyText}>Open in Bluesky</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.followButton,
                profile.isFollowing && styles.followingButton,
                isFollowLoading && styles.loadingButton,
              ]}
              onPress={handleFollow}
              disabled={isFollowLoading}
              activeOpacity={0.85}
            >
              {profile.isFollowing ? (
                <Text style={styles.followingText}>Following</Text>
              ) : (
                <LinearGradient
                  colors={[...colors.gradient.button]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.followGradient}
                >
                  <Text style={styles.followText}>
                    {isFollowLoading ? "..." : "Follow"}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Name / Handle / Follows you badge */}
        <View style={styles.nameSection}>
          <Text style={styles.displayName}>{profile.displayName || profile.handle}</Text>
          <View style={styles.handleRow}>
            <Text style={styles.handle}>@{profile.handle}</Text>
            {profile.isFollowedBy && (
              <View style={styles.followsYouBadge}>
                <Text style={styles.followsYouText}>Follows you</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {profile.description ? (
          <Text style={styles.description}>{profile.description}</Text>
        ) : null}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatCount(profile.followsCount)}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatCount(profile.followersCount)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatCount(profile.postsCount)}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>

        {/* Posts header */}
        <View style={styles.postsHeader}>
          <Text style={styles.postsHeaderText}>Recent Posts</Text>
          <View style={styles.postsHeaderLine} />
        </View>
      </View>
    );
  }, [profile, isFollowLoading, handleFollow, handleOpenInBsky]);

  if (isLoading) {
    return (
      <LinearGradient colors={[...colors.gradient.aurora]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.cyan} />
        </View>
      </LinearGradient>
    );
  }

  if (!profile) {
    return (
      <LinearGradient colors={[...colors.gradient.aurora]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[...colors.gradient.aurora]} style={styles.container}>
      {/* Back button */}
      <View style={styles.backBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.uri}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyPostsText}>No posts yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.body,
  },
  backBar: {
    paddingTop: 54,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.medium,
    color: colors.accent.cyan,
  },
  banner: {
    width: "100%",
    height: 140,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginTop: -36,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.bg.primary,
  },
  avatarPlaceholder: {
    backgroundColor: colors.bg.cardHover,
  },
  avatarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  openBskyButton: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  openBskyText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.medium,
  },
  followButton: {
    borderRadius: radius.full,
    overflow: "hidden",
  },
  followGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  followText: {
    color: colors.text.primary,
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.semibold,
  },
  followingButton: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: "transparent",
  },
  followingText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  loadingButton: {
    opacity: 0.6,
  },
  nameSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  displayName: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.tight,
  },
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 2,
  },
  handle: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
  },
  followsYouBadge: {
    backgroundColor: colors.bg.cardHover,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  followsYouText: {
    fontSize: typography.sizes.micro,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  description: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
  },
  postsHeader: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  postsHeaderText: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  postsHeaderLine: {
    height: 2,
    width: 32,
    backgroundColor: colors.accent.cyan,
    borderRadius: 1,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  postCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  postText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.primary,
    lineHeight: 20,
  },
  postImages: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  postImage: {
    width: 120,
    height: 120,
    borderRadius: radius.sm,
  },
  // External link card
  linkCard: {
    marginTop: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.bg.input,
    overflow: "hidden",
  },
  linkThumb: {
    width: "100%",
    height: 140,
    backgroundColor: colors.bg.cardHover,
  },
  linkContent: {
    padding: spacing.md,
  },
  linkTitle: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  linkDescription: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  linkUrl: {
    fontSize: typography.sizes.micro,
    color: colors.text.tertiary,
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  postStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  postStat: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
  },
  postStatMuted: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    marginLeft: "auto",
  },
  emptyPosts: {
    padding: spacing.xxl,
    alignItems: "center",
  },
  emptyPostsText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
  },
});
