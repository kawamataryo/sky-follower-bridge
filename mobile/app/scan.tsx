import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import type { CrawledUserInfo } from "~/types";
import {
  ActivityIndicator,
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

export default function ScanScreen() {
  const router = useRouter();
  const { agent } = useAuth();
  const { status, scannedCount, matchedUsers, setStatus, processUsers } =
    useScan();
  const webviewRef = useRef<WebView>(null);
  const processingRef = useRef(false);
  const pendingUsers = useRef<CrawledUserInfo[]>([]);

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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {status === "completed" ? "Scan Complete" : "Scanning..."}
        </Text>

        {status !== "completed" && (
          <ActivityIndicator
            size="small"
            color="#0085FF"
            style={styles.spinner}
          />
        )}

        <ScanProgress
          scannedCount={scannedCount}
          matchedCount={matchedUsers.length}
        />

        {status === "completed" ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleViewResults}
          >
            <Text style={styles.buttonText}>
              View {matchedUsers.length} matched users
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStop}
          >
            <Text style={styles.buttonText}>Stop Scanning</Text>
          </TouchableOpacity>
        )}
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  spinner: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#0085FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  stopButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  offscreen: {
    position: "absolute",
    left: -9999,
    width: 1,
    height: 1,
  },
});
