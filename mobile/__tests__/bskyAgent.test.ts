import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/lib/bskyOAuthClient", () => ({
  expoOAuthClient: {
    signIn: vi.fn(),
    restore: vi.fn(),
    revoke: vi.fn(),
  },
}));

vi.mock("@atproto/api", () => {
  class Agent {
    public readonly sessionManager: unknown;
    constructor(sm: unknown) {
      this.sessionManager = sm;
    }
    getProfile(_args: { actor: string }): Promise<{ data: { handle: string } }> {
      return Promise.resolve({ data: { handle: "alice.bsky.social" } });
    }
  }
  class AtpAgent extends Agent {
    public session: { handle: string; did: string } | undefined;
    constructor(_opts: { service: string }) {
      super({});
    }
    async resumeSession(session: {
      handle: string;
      did: string;
    }): Promise<void> {
      this.session = session;
    }
    async login(_opts: unknown): Promise<{ data: unknown }> {
      // Default impl — override via vi.spyOn in tests that need it
      return { data: {} };
    }
  }
  return { Agent, AtpAgent };
});

import { Agent, AtpAgent } from "@atproto/api";
import { expoOAuthClient } from "~/lib/bskyOAuthClient";
import { createAgentWithAppPassword, restoreAgent } from "~/lib/bskyAgent";
import type { SessionData } from "~/types";

describe("restoreAgent (OAuth branch)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Agent.prototype, "getProfile").mockResolvedValue({
      data: { handle: "alice.bsky.social" },
    } as never);
  });

  it("returns agent and handle when OAuth restore succeeds", async () => {
    const fakeSession = {
      sub: "did:plc:abc123",
      serverMetadata: { issuer: "https://bsky.social" },
      fetchHandler: vi.fn(),
    };
    vi.mocked(expoOAuthClient.restore).mockResolvedValue(fakeSession as never);

    const sessionData: SessionData = {
      authMethod: "oauth",
      sub: "did:plc:abc123",
    };

    const result = await restoreAgent(sessionData);

    expect(result).not.toBeNull();
    expect(result?.handle).toBe("alice.bsky.social");
    expect(expoOAuthClient.restore).toHaveBeenCalledWith("did:plc:abc123");
  });

  it("returns null and calls revoke when OAuth restore fails", async () => {
    vi.mocked(expoOAuthClient.restore).mockRejectedValue(
      new Error("session expired"),
    );
    vi.mocked(expoOAuthClient.revoke).mockResolvedValue(undefined);

    const sessionData: SessionData = {
      authMethod: "oauth",
      sub: "did:plc:abc123",
    };

    const result = await restoreAgent(sessionData);

    expect(result).toBeNull();
    expect(expoOAuthClient.revoke).toHaveBeenCalledWith("did:plc:abc123");
  });

  it("swallows revoke errors during failed restore", async () => {
    vi.mocked(expoOAuthClient.restore).mockRejectedValue(
      new Error("restore failed"),
    );
    vi.mocked(expoOAuthClient.revoke).mockRejectedValue(new Error("offline"));

    const sessionData: SessionData = {
      authMethod: "oauth",
      sub: "did:plc:abc123",
    };

    const result = await restoreAgent(sessionData);
    expect(result).toBeNull();
  });

  it("returns null immediately when sub is empty (stale marker)", async () => {
    const sessionData: SessionData = {
      authMethod: "oauth",
      sub: "",
    };

    const result = await restoreAgent(sessionData);

    expect(result).toBeNull();
    expect(expoOAuthClient.restore).not.toHaveBeenCalled();
  });

  it("returns agent with empty handle (and preserves session) when getProfile fails after successful restore", async () => {
    vi.mocked(expoOAuthClient.restore).mockResolvedValue({
      sub: "did:plc:abc123",
      serverMetadata: { issuer: "https://bsky.social" },
      fetchHandler: vi.fn(),
    } as never);
    vi.spyOn(Agent.prototype, "getProfile").mockRejectedValue(
      new Error("network"),
    );

    const sessionData: SessionData = {
      authMethod: "oauth",
      sub: "did:plc:abc123",
    };

    const result = await restoreAgent(sessionData);
    // Don't destroy a valid MMKV session over a transient getProfile failure.
    // Next real API call will surface a true auth failure if the session is expired.
    expect(result).not.toBeNull();
    expect(result?.handle).toBe("");
    expect(expoOAuthClient.revoke).not.toHaveBeenCalled();
  });
});

describe("restoreAgent (app-password branch)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns agent and handle when resumeSession succeeds", async () => {
    const sessionData: SessionData = {
      authMethod: "app-password",
      service: "https://bsky.social",
      session: JSON.stringify({
        handle: "bob.bsky.social",
        did: "did:plc:bob",
        accessJwt: "jwt",
        refreshJwt: "rjwt",
        active: true,
      }),
    };

    const result = await restoreAgent(sessionData);

    expect(result).not.toBeNull();
    expect(result?.handle).toBe("bob.bsky.social");
  });

  it("propagates resumeSession failures", async () => {
    const sessionData: SessionData = {
      authMethod: "app-password",
      service: "https://bsky.social",
      session: JSON.stringify({
        handle: "bob.bsky.social",
        did: "did:plc:bob",
        accessJwt: "jwt",
        refreshJwt: "rjwt",
        active: true,
      }),
    };

    const spy = vi
      .spyOn(AtpAgent.prototype, "resumeSession")
      .mockRejectedValueOnce(new Error("expired"));

    try {
      await expect(restoreAgent(sessionData)).rejects.toThrow("expired");
    } finally {
      spy.mockRestore();
    }
  });
});

describe("createAgentWithAppPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns agent and sessionData on successful login", async () => {
    const spy = vi
      .spyOn(AtpAgent.prototype, "login")
      .mockResolvedValueOnce({
        data: {
          handle: "carol.bsky.social",
          did: "did:plc:carol",
          accessJwt: "jwt",
          refreshJwt: "rjwt",
          active: true,
        },
      } as never);

    try {
      const result = await createAgentWithAppPassword({
        identifier: "carol.bsky.social",
        password: "app-pass-1234",
      });

      expect(result.sessionData.authMethod).toBe("app-password");
      if (result.sessionData.authMethod === "app-password") {
        expect(result.sessionData.service).toBe("https://bsky.social");
        const parsed = JSON.parse(result.sessionData.session);
        expect(parsed.handle).toBe("carol.bsky.social");
      }
    } finally {
      spy.mockRestore();
    }
  });
});
