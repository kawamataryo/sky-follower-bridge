import { Agent } from "@atproto/api";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createAgentWithAppPassword, restoreAgent } from "~/lib/bskyAgent";
import { loginWithOAuth } from "~/lib/bskyOAuth";
import { expoOAuthClient } from "~/lib/bskyOAuthClient";
import { clearSession, loadSession, saveSession } from "~/lib/sessionStorage";
import type { SessionData } from "~/types";

type AuthState = {
  agent: Agent | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  handle: string | null;
  loginWithAppPassword: (params: {
    identifier: string;
    password: string;
    authFactorToken?: string;
    service?: string;
  }) => Promise<void>;
  loginWithOAuth: (identifier: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await loadSession();
        if (!session) return;

        // sub 空値ガード: 旧バグの残骸データで restore を走らせない
        if (session.authMethod === "oauth" && !session.sub) {
          await clearSession();
          return;
        }

        const restored = await restoreAgent(session);
        if (restored) {
          setAgent(restored.agent);
          setHandle(restored.handle || null);
        } else {
          // restore 失敗時は secure-store マーカーもクリア
          await clearSession();
          if (session.authMethod === "oauth" && session.sub) {
            await expoOAuthClient.revoke(session.sub).catch(() => {});
          }
        }
      } catch (e) {
        console.error("Session restore failed:", e);
        await clearSession().catch(() => {});
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginWithAppPassword = useCallback(
    async (params: {
      identifier: string;
      password: string;
      authFactorToken?: string;
      service?: string;
    }) => {
      const { agent: newAgent, sessionData } =
        await createAgentWithAppPassword(params);
      await saveSession(sessionData);
      setAgent(newAgent);
      setHandle(newAgent.session?.handle ?? null);
    },
    [],
  );

  const handleOAuthLogin = useCallback(async (identifier: string) => {
    // loginWithOAuth throws OAuthLoginError("unknown") if sub is empty,
    // so we can trust `sub` here without an extra guard.
    const { agent: newAgent, sub, handle: newHandle } =
      await loginWithOAuth(identifier);
    const sessionData: SessionData = { authMethod: "oauth", sub };
    await saveSession(sessionData);
    setAgent(newAgent);
    setHandle(newHandle);
  }, []);

  const logout = useCallback(async () => {
    // 先に現在のセッション情報を読む (clearSession 後は読めないため)
    const current = await loadSession();
    if (current?.authMethod === "oauth" && current.sub) {
      // MMKV purge + revoke は best-effort
      await expoOAuthClient.revoke(current.sub).catch(() => {});
    }
    await clearSession();
    setAgent(null);
    setHandle(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        agent,
        isLoading,
        isLoggedIn: agent !== null,
        handle,
        loginWithAppPassword,
        loginWithOAuth: handleOAuthLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
