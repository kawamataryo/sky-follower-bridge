import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "~/lib/theme";

type Props = {
  scannedCount: number;
  matchedCount: number;
};

export function ScanProgress({ scannedCount, matchedCount }: Props) {
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (matchedCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [matchedCount, glowAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.label}>SCANNED</Text>
        <Text style={styles.value}>{scannedCount}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.column}>
        <Text style={styles.label}>MATCHED</Text>
        <Animated.View
          style={
            matchedCount > 0
              ? {
                  shadowColor: colors.accent.cyan,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: glowAnim,
                  shadowRadius: 12,
                }
              : undefined
          }
        >
          <Text style={[styles.value, styles.matchedValue]}>
            {matchedCount}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: colors.border.medium,
  },
  label: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semibold,
    color: colors.text.tertiary,
    letterSpacing: typography.letterSpacing.extraWide,
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 36,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  matchedValue: {
    color: colors.accent.cyan,
  },
});
