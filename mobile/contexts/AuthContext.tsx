import { AtpAgent } from "@atproto/api";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createAgentWithAppPassword, restoreAgent } from "~/lib/bskyAgent";
import { clearSession, loadSession, saveSession } from "~/lib/sessionStorage";
import type { SessionData } from "~/types";

type AuthState = {
  agent: AtpAgent | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  handle: string | null;
  loginWithAppPassword: (params: {
    identifier: string;
    password: string;
    authFactorToken?: string;
    service?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<AtpAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await loadSession();
        if (session) {
          const restored = await restoreAgent(session);
          if (restored) {
            setAgent(restored);
            setHandle(restored.session?.handle ?? null);
          }
        }
      } catch (e) {
        console.error("Session restore failed:", e);
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

  const logout = useCallback(async () => {
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
