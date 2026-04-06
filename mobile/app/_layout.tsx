import { Stack } from "expo-router";
import { AuthProvider } from "~/contexts/AuthContext";
import { ScanProvider } from "~/contexts/ScanContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ScanProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="x-login-guide" />
          <Stack.Screen name="x-login" />
          <Stack.Screen name="scan" />
          <Stack.Screen name="results" />
          <Stack.Screen name="profile" />
        </Stack>
      </ScanProvider>
    </AuthProvider>
  );
}
