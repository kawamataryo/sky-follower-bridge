import { useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UserCard } from "~/components/UserCard";
import { useAuth } from "~/contexts/AuthContext";
import { useScan } from "~/contexts/ScanContext";
import type { BskyUser } from "~/types";

export default function ResultsScreen() {
  const router = useRouter();
  const { agent } = useAuth();
  const { matchedUsers, reset } = useScan();

  const handleFollow = useCallback(
    async (user: BskyUser) => {
      if (!agent) return;
      await agent.follow(user.did);
    },
    [agent],
  );

  const handleScanAgain = () => {
    reset();
    router.replace("/x-login-guide");
  };

  const renderItem = useCallback(
    ({ item }: { item: BskyUser }) => (
      <UserCard user={item} onFollow={handleFollow} />
    ),
    [handleFollow],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {matchedUsers.length} users found
        </Text>
      </View>

      <FlatList
        data={matchedUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.did}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No matching users found</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 24,
    paddingBottom: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  list: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
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
