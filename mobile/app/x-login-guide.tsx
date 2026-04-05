import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function XLoginGuideScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔍</Text>
      <Text style={styles.title}>Scan your X follows</Text>
      <Text style={styles.description}>
        Next, you'll log in to X (Twitter) so we can scan your following list
        and find matching Bluesky accounts.
      </Text>
      <Text style={styles.note}>
        Your X credentials are only used within the app's browser and are never
        sent to our servers.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/x-login")}
      >
        <Text style={styles.buttonText}>Open X Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#444",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  note: {
    fontSize: 13,
    color: "#888",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#0085FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
