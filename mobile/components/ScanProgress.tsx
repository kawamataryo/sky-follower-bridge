import { StyleSheet, Text, View } from "react-native";

type Props = {
  scannedCount: number;
  matchedCount: number;
};

export function ScanProgress({ scannedCount, matchedCount }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Scanned</Text>
        <Text style={styles.value}>{scannedCount}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Matched</Text>
        <Text style={[styles.value, styles.matchedValue]}>{matchedCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  row: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#ddd",
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  value: {
    fontSize: 32,
    fontWeight: "bold",
  },
  matchedValue: {
    color: "#0085FF",
  },
});
