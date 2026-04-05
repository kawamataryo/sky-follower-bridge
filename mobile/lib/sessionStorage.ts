import * as SecureStore from "expo-secure-store";
import type { SessionData } from "~/types";
import { SECURE_STORE_KEYS } from "./constants";

export async function saveSession(session: SessionData): Promise<void> {
  await SecureStore.setItemAsync(
    SECURE_STORE_KEYS.SESSION,
    JSON.stringify(session),
  );
}

export async function loadSession(): Promise<SessionData | null> {
  const raw = await SecureStore.getItemAsync(SECURE_STORE_KEYS.SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.SESSION);
}
