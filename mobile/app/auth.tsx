import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "~/contexts/AuthContext";
import { colors, radius, shadows, spacing, typography } from "~/lib/theme";

export default function AuthScreen() {
  const router = useRouter();
  const { loginWithAppPassword } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter your identifier and app password.");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithAppPassword({
        identifier: identifier.trim(),
        password: password.trim(),
      });
      router.replace("/x-login-guide");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      Alert.alert("Login Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={[...colors.gradient.aurora]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeIn }}>

          {/* Step Indicator */}
          <View style={styles.stepContainer}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepDot} />
            <View style={styles.stepDot} />
          </View>
          <Text style={styles.stepLabel}>STEP 1 OF 3</Text>

          <Text style={styles.title}>Connect Bluesky</Text>
          <Text style={styles.subtitle}>
            Use your handle and an App Password
          </Text>

          {/* Handle Input */}
          <View
            style={[
              styles.inputContainer,
              focusedField === "handle" && styles.inputContainerFocused,
            ]}
          >
            <Text style={styles.inputPrefix}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="alice.bsky.social"
              placeholderTextColor={colors.text.tertiary}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedField("handle")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password Input */}
          <View
            style={[
              styles.inputContainer,
              focusedField === "password" && styles.inputContainerFocused,
            ]}
          >
            <TextInput
              style={[styles.input, styles.inputFull]}
              placeholder="App Password"
              placeholderTextColor={colors.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          <Text style={styles.hint}>
            Generate an App Password in Bluesky Settings → Privacy & Security
          </Text>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[...colors.gradient.button]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  inputContainerFocused: {
    borderColor: colors.accent.blue,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputPrefix: {
    fontSize: typography.sizes.body,
    color: colors.text.tertiary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: colors.text.primary,
    paddingVertical: 14,
  },
  inputFull: {
    paddingLeft: 0,
  },
  hint: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xl,
    marginTop: -spacing.xs,
  },
  button: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginTop: spacing.sm,
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
});
