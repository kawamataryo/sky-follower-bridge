import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CrawledUserInfo } from "~/types";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent, WebViewNavigation } from "react-native-webview";
import { ScanProgress } from "~/components/ScanProgress";
import { useAuth } from "~/contexts/AuthContext";
import { useScan } from "~/contexts/ScanContext";
import { X_FOLLOW_PAGE_URL, X_LOGIN_URL } from "~/lib/constants";
import { parseExtractedUsers, buildScrapeScript } from "~/lib/webviewScripts";
import { colors, radius, shadows, spacing, typography } from "~/lib/theme";

type Phase = "x_login" | "scanning" | "completed";

// Detect login completion: user is on x.com but NOT in login/auth flow
const X_LOGIN_FLOW_PATTERNS = [
  /\/i\/flow\/login/,
  /\/i\/flow\/signup/,
  /\/login/,
  /\/account\/access/,
  /\/oauth/,
];

const isOnXButNotLoginFlow = (url: string): boolean => {
  const isXDomain = /^https:\/\/(x|twitter)\.com/.test(url);
  const isLoginFlow = X_LOGIN_FLOW_PATTERNS.some((p) => p.test(url));
  return isXDomain && !isLoginFlow;
};

const X_FOLLOWING_PATTERN = /^https:\/\/(x|twitter)\.com\/[^/]+\/(verified_follow|follow)/;

export default function ScanScreen() {
  const router = useRouter();
  const { agent } = useAuth();
  const { status, scannedCount, matchedUsers, setStatus, processUsers } =
    useScan();
  const webviewRef = useRef<WebView>(null);
  const processingRef = useRef(false);
  const pendingUsers = useRef<CrawledUserInfo[]>([]);
  const hasStartedScan = useRef(false);

  const [phase, setPhase] = useState<Phase>("x_login");

  // Pulse animation for scanning state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim1 = useRef(new Animated.Value(0.6)).current;
  const ringAnim2 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (phase === "scanning") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      const ring1 = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim1, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim1, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );
      const ring2 = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim2, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim2, {
            toValue: 0.2,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      ring1.start();
      ring2.start();
      return () => {
        pulse.stop();
        ring1.stop();
        ring2.stop();
      };
    }
  }, [phase, pulseAnim, ringAnim1, ringAnim2]);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      if (phase !== "x_login") return;

      if (isOnXButNotLoginFlow(navState.url)) {
        // Logged in — navigate to following page
        setPhase("scanning");
        setStatus("scanning");
        webviewRef.current?.injectJavaScript(
          `window.location.href = ${JSON.stringify(X_FOLLOW_PAGE_URL)}; true;`,
        );
      }

      // If already on a following page (user was already logged in)
      if (X_FOLLOWING_PATTERN.test(navState.url) && !hasStartedScan.current) {
        hasStartedScan.current = true;
        setPhase("scanning");
        setStatus("scanning");
        webviewRef.current?.injectJavaScript(buildScrapeScript());
      }
    },
    [phase, setStatus],
  );

  const handleLoadEnd = useCallback(() => {
    // When following page loads, inject scrape script
    if (phase === "scanning" && !hasStartedScan.current) {
      hasStartedScan.current = true;
      // Small delay to let page render
      setTimeout(() => {
        webviewRef.current?.injectJavaScript(buildScrapeScript());
      }, 2000);
    }
  }, [phase]);

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      if (!agent) return;

      const message = parseExtractedUsers(event.nativeEvent.data);
      if (!message) return;

      if (message.type === "users") {
        pendingUsers.current.push(...message.payload);
        if (!processingRef.current) {
          processingRef.current = true;
          while (pendingUsers.current.length > 0) {
            const batch = pendingUsers.current.splice(0, pendingUsers.current.length);
            await processUsers(batch, agent);
          }
          processingRef.current = false;
        }
      } else if (message.type === "scroll_end") {
        setPhase("completed");
        setStatus("completed");
      }
    },
    [agent, processUsers, setStatus],
  );

  const handleStop = () => {
    webviewRef.current?.injectJavaScript(
      'window.postMessage(JSON.stringify({type:"stop_scan"})); true;',
    );
    setPhase("completed");
    setStatus("completed");
  };

  const handleViewResults = () => {
    router.push("/results");
  };

  const isLoginPhase = phase === "x_login";
  const isComplete = phase === "completed";

  return (
    <View style={styles.container}>
      {/* WebView — full screen during login, off-screen during scan */}
      <View style={isLoginPhase ? styles.webviewFull : styles.offscreen}>
        {isLoginPhase && (
          <View style={styles.webviewHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.webviewHeaderText}>Sign in to X to continue</Text>
            <View style={styles.backButton} />
          </View>
        )}
        <WebView
          ref={webviewRef}
          source={{ uri: X_LOGIN_URL }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadEnd={handleLoadEnd}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
        />
      </View>

      {/* Scanning / Complete overlay */}
      {!isLoginPhase && (
        <LinearGradient colors={[...colors.gradient.aurora]} style={styles.overlay}>
          <View style={styles.content}>
            {/* Step Indicator */}
            <View style={styles.stepContainer}>
              <View style={styles.stepDot} />
              <View style={styles.stepDot} />
              <View style={[styles.stepDot, styles.stepDotActive]} />
            </View>
            <Text style={styles.stepLabel}>STEP 3 OF 3</Text>

            {/* Scan Icon with Pulsing Rings */}
            <View style={styles.scanIconWrapper}>
              {!isComplete && (
                <>
                  <Animated.View
                    style={[
                      styles.pulseRing,
                      styles.pulseRingOuter,
                      { opacity: ringAnim2, transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.pulseRing,
                      styles.pulseRingInner,
                      { opacity: ringAnim1 },
                    ]}
                  />
                </>
              )}
              <View style={[styles.scanIcon, isComplete && styles.scanIconComplete]}>
                <Text style={styles.scanIconText}>
                  {isComplete ? "✓" : "⟳"}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>
              {isComplete ? "Scan Complete" : "Scanning..."}
            </Text>

            <ScanProgress
              scannedCount={scannedCount}
              matchedCount={matchedUsers.length}
            />

            {isComplete ? (
              <TouchableOpacity
                style={styles.button}
                onPress={handleViewResults}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[...colors.gradient.button]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    View {matchedUsers.length} matched users
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStop}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[...colors.gradient.danger]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Stop Scanning</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  webviewFull: {
    flex: 1,
  },
  webviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bg.secondary,
    paddingTop: 58,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  webviewHeaderText: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.medium,
    color: colors.accent.cyan,
  },
  webview: {
    flex: 1,
  },
  offscreen: {
    position: "absolute",
    left: -9999,
    width: 400,
    height: 800,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: spacing.xxl,
  },
  scanIconWrapper: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  pulseRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.accent.cyan,
  },
  pulseRingOuter: {
    width: 120,
    height: 120,
  },
  pulseRingInner: {
    width: 90,
    height: 90,
  },
  scanIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.bg.card,
    borderWidth: 2,
    borderColor: colors.accent.cyan,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.glow,
  },
  scanIconComplete: {
    borderColor: colors.status.success,
    shadowColor: colors.status.success,
  },
  scanIconText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  title: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.tight,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  button: {
    width: "100%",
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.button,
  },
  stopButton: {
    width: "100%",
    borderRadius: radius.lg,
    overflow: "hidden",
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
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
