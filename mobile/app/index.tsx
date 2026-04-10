import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "~/contexts/AuthContext";
import { colors, radius, shadows, spacing, typography } from "~/lib/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const { isLoading, isLoggedIn } = useAuth();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
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
      ]),
    ]).start();
  }, [fadeIn, slideUp, logoScale, glowOpacity]);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace("/x-login-guide");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={[...colors.gradient.aurora]}
        style={styles.container}
      >
        <ActivityIndicator size="large" color={colors.accent.cyan} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[...colors.gradient.aurora]}
      style={styles.container}
    >
      {/* Aurora glow effect */}
      <Animated.View style={[styles.glowOrb, { opacity: glowOpacity }]}>
        <LinearGradient
          colors={[
            "rgba(0, 133, 255, 0.15)",
            "rgba(0, 194, 255, 0.08)",
            "transparent",
          ]}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <View style={styles.content}>
        {/* Logo / Brand */}
        <Animated.View
          style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}
        >
          <Image
            source={require("~/assets/icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          <Text style={styles.title}>Sky Follower</Text>
          <Text style={styles.titleAccent}>Bridge</Text>
          <Text style={styles.subtitle}>
            Find your X connections on Bluesky
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonContainer,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/auth")}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[...colors.gradient.button]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.versionText}>v1.0.0</Text>
        </Animated.View>
      </View>
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
    alignItems: "center",
    padding: spacing.xl,
  },
  glowOrb: {
    position: "absolute",
    top: -100,
    left: -50,
    right: -50,
    height: 400,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 200,
  },
  logoContainer: {
    marginBottom: spacing.xxl,
  },
  logoImage: {
    width: 112,
    height: 112,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.tight,
  },
  titleAccent: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.heavy,
    color: colors.accent.cyan,
    letterSpacing: typography.letterSpacing.tight,
    marginTop: -4,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.button,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
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
  versionText: {
    fontSize: typography.sizes.micro,
    color: colors.text.tertiary,
    marginTop: spacing.lg,
    letterSpacing: typography.letterSpacing.extraWide,
    textTransform: "uppercase",
  },
});
