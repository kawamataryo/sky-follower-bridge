import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TypeaheadDropdown } from "~/components/TypeaheadDropdown";
import { useAuth } from "~/contexts/AuthContext";
import { colors, radius, shadows, spacing, typography } from "~/lib/theme";

export default function AuthScreen() {
  const router = useRouter();
  const { loginWithAppPassword, loginWithOAuth } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [showTypeahead, setShowTypeahead] = useState(false);

  const handleOAuthLogin = async (handleOverride?: string) => {
    const handle = handleOverride || identifier.trim();
    if (!handle) {
      Alert.alert("Error", "Please enter your Bluesky handle.");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithOAuth(handle);
      router.replace("/x-login-guide");
    } catch (e) {
      const message = e instanceof Error ? e.message : "OAuth login failed";
      Alert.alert("Login Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppPasswordLogin = async () => {
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
          bounces={false}
        >
          {/* Step Indicator */}
          <View style={styles.stepContainer}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepDot} />
            <View style={styles.stepDot} />
          </View>
          <Text style={styles.stepLabel}>STEP 1 OF 3</Text>

          <Text style={styles.title}>Connect Bluesky</Text>
          <Text style={styles.subtitle}>
            Sign in to your Bluesky account to get started
          </Text>

          {/* Handle Input (shared by both methods) */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="alice.bsky.social"
              placeholderTextColor={colors.text.tertiary}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
              returnKeyType={showAppPassword ? "next" : "done"}
              onSubmitEditing={showAppPassword ? undefined : () => handleOAuthLogin()}
              onFocus={() => !showAppPassword && setShowTypeahead(true)}
              onBlur={() => setTimeout(() => setShowTypeahead(false), 200)}
            />
          </View>

          {/* Typeahead dropdown (OAuth mode only) */}
          {!showAppPassword && (
            <TypeaheadDropdown
              query={identifier}
              visible={showTypeahead && !isLoading}
              onSelect={(handle) => {
                setIdentifier(handle);
                setShowTypeahead(false);
                handleOAuthLogin(handle);
              }}
            />
          )}

          {/* OAuth Button (primary) */}
          {!showAppPassword && (
            <>
              <TouchableOpacity
                style={[styles.oauthButton, isLoading && styles.buttonDisabled]}
                onPress={() => handleOAuthLogin()}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[...colors.gradient.button]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.oauthButtonGradient}
                >
                  <Ionicons
                    name="log-in-outline"
                    size={20}
                    color={colors.text.primary}
                    style={styles.oauthIcon}
                  />
                  <Text style={styles.oauthButtonText}>
                    {isLoading ? "Signing in..." : "Sign in with Bluesky"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.oauthHint}>
                You'll be redirected to Bluesky to authorize this app
              </Text>

              {/* App Password fallback link */}
              <TouchableOpacity
                style={styles.fallbackLink}
                onPress={() => setShowAppPassword(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.fallbackText}>
                  Use App Password instead
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* App Password section (fallback) */}
          {showAppPassword && (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.inputFull]}
                  placeholder="App Password"
                  placeholderTextColor={colors.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardAppearance="dark"
                  returnKeyType="done"
                  onSubmitEditing={handleAppPasswordLogin}
                />
              </View>
              <Text style={styles.hint}>
                Generate an App Password in Bluesky Settings → Privacy & Security
              </Text>

              <TouchableOpacity
                style={[styles.oauthButton, isLoading && styles.buttonDisabled]}
                onPress={handleAppPasswordLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[...colors.gradient.button]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.oauthButtonGradient}
                >
                  <Text style={styles.oauthButtonText}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to OAuth link */}
              <TouchableOpacity
                style={styles.fallbackLink}
                onPress={() => setShowAppPassword(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.fallbackText}>
                  ← Back to OAuth sign in
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  oauthButton: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginTop: spacing.sm,
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  oauthButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  oauthIcon: {
    marginRight: spacing.xs,
  },
  oauthButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  oauthHint: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.md,
  },
  hint: {
    fontSize: typography.sizes.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xl,
    marginTop: -spacing.xs,
  },
  fallbackLink: {
    alignItems: "center",
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  fallbackText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.tertiary,
  },
});
