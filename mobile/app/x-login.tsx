import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import { X_LOGIN_URL } from "~/lib/constants";
import { colors, spacing, typography } from "~/lib/theme";

const X_HOME_PATTERNS = [
  /^https:\/\/(x|twitter)\.com\/home/,
  /^https:\/\/(x|twitter)\.com\/$/,
  /^https:\/\/(x|twitter)\.com\/?(\?|#|$)/,
];

export default function XLoginScreen() {
  const router = useRouter();
  const webviewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasRedirected = useRef(false);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    if (hasRedirected.current) return;

    const isLoggedIn = X_HOME_PATTERNS.some((pattern) =>
      pattern.test(navState.url),
    );

    if (isLoggedIn) {
      hasRedirected.current = true;
      router.replace("/scan");
    }
  };

  return (
    <View style={styles.container}>
      {/* Dark status bar area */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Signing in to X</Text>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={colors.accent.cyan}
            style={styles.headerSpinner}
          />
        )}
      </View>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent.cyan} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <WebView
        ref={webviewRef}
        source={{ uri: X_LOGIN_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg.secondary,
    paddingTop: 54,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerText: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  headerSpinner: {
    marginLeft: spacing.sm,
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg.overlay,
    zIndex: 1,
  },
  loadingText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});
