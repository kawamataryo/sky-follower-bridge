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
    resumeSession = vi.fn(async (session: { handle: string; did: string }) => {
      this.session = session;
    });
  }
  return { Agent, AtpAgent };
});

import { Agent } from "@atproto/api";
import { expoOAuthClient } from "~/lib/bskyOAuthClient";
import { restoreAgent } from "~/lib/bskyAgent";
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

  it("returns null when getProfile fails after successful restore", async () => {
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
    expect(result).toBeNull();
    // OAuth session was restored locally but profile fetch failed → revoke MMKV
    expect(expoOAuthClient.revoke).toHaveBeenCalledWith("did:plc:abc123");
  });
});
