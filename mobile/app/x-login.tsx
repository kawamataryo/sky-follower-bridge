import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import { X_LOGIN_URL } from "~/lib/constants";

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
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0085FF" />
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
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 1,
  },
});
