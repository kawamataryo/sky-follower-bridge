import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "~/contexts/AuthContext";
import { colors, radius, shadows, spacing, typography } from "~/lib/theme";

export default function XLoginGuideScreen() {
  const router = useRouter();
  const { logout, handle } = useAuth();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeIn, slideUp]);

  return (
    <LinearGradient colors={[...colors.gradient.aurora]} style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeIn, transform: [{ translateY: slideUp }] },
        ]}
      >
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDot} />
        </View>
        <Text style={styles.stepLabel}>STEP 2 OF 3</Text>

        {/* Bridge Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.bridgeIcon}>
            <View style={styles.bridgePillarLeft} />
            <View style={styles.bridgeArc} />
            <View style={styles.bridgePillarRight} />
          </View>
          <View style={styles.bridgeDeck} />
        </View>

        <Text style={styles.title}>Scan Your Network</Text>
        <Text style={styles.description}>
          Next, you'll log in to X (Twitter) so we can scan your following list
          and find matching Bluesky accounts.
        </Text>

        {/* Privacy Card */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>
            Your X credentials are only used within the app's browser and are
            never sent to our servers.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/scan")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[...colors.gradient.button]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Continue to X</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Switch account */}
        <TouchableOpacity
          style={styles.switchAccount}
          onPress={() => {
            logout();
            router.replace("/");
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.switchAccountText}>
            Signed in as @{handle} · Switch account
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.medium,
  },
  stepDotActive: {
    backgroundColor: colors.accent.cyan,
    ...shadows.glow,
  },
  stepLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semibold,
    color: colors.accent.cyan,
    letterSpacing: typography.letterSpacing.extraWide,
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxl,
    height: 80,
  },
  bridgeIcon: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    width: 80,
    height: 50,
  },
  bridgePillarLeft: {
    width: 6,
    height: 40,
    backgroundColor: colors.accent.cyan,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  bridgeArc: {
    width: 40,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.accent.cyan,
    marginHorizontal: -2,
  },
  bridgePillarRight: {
    width: 6,
    height: 40,
    backgroundColor: colors.accent.cyan,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  bridgeDeck: {
    width: 90,
    height: 4,
    backgroundColor: colors.accent.blue,
    borderRadius: 2,
    marginTop: -2,
  },
  title: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.tight,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  privacyIcon: {
    fontSize: 20,
  },
  privacyText: {
    flex: 1,
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  button: {
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.button,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  buttonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  buttonArrow: {
    fontSize: typography.sizes.h3,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  switchAccount: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  switchAccountText: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
  },
});
