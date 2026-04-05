import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import type { CrawledUserInfo } from "~/types";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import { ScanProgress } from "~/components/ScanProgress";
import { useAuth } from "~/contexts/AuthContext";
import { useScan } from "~/contexts/ScanContext";
import { X_FOLLOW_PAGE_URL } from "~/lib/constants";
import { parseExtractedUsers, buildScrapeScript } from "~/lib/webviewScripts";
import { colors, radius, shadows, spacing, typography } from "~/lib/theme";

export default function ScanScreen() {
  const router = useRouter();
  const { agent } = useAuth();
  const { status, scannedCount, matchedUsers, setStatus, processUsers } =
    useScan();
  const webviewRef = useRef<WebView>(null);
  const processingRef = useRef(false);
  const pendingUsers = useRef<CrawledUserInfo[]>([]);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim1 = useRef(new Animated.Value(0.6)).current;
  const ringAnim2 = useRef(new Animated.Value(0.4)).current;

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

  useEffect(() => {
    if (status !== "completed") {
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
  }, [status, pulseAnim, ringAnim1, ringAnim2]);

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
        setStatus("completed");
      }
    },
    [agent, processUsers, setStatus],
  );

  const handleStop = () => {
    webviewRef.current?.injectJavaScript(
      'window.postMessage(JSON.stringify({type:"stop_scan"})); true;',
    );
    setStatus("completed");
  };

  const handleViewResults = () => {
    router.push("/results");
  };

  const isComplete = status === "completed";

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
      </Animated.View>

      {/* Off-screen WebView for scraping */}
      <View style={styles.offscreen}>
        <WebView
          ref={webviewRef}
          source={{ uri: X_FOLLOW_PAGE_URL }}
          injectedJavaScript={buildScrapeScript()}
          onMessage={handleMessage}
          onLoadStart={() => setStatus("scanning")}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
        />
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
  offscreen: {
    position: "absolute",
    left: -9999,
    width: 1,
    height: 1,
  },
});
