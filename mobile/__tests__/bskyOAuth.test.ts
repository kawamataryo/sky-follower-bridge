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
  return { Agent };
});

import { Agent } from "@atproto/api";
import { expoOAuthClient } from "~/lib/bskyOAuthClient";
import { loginWithOAuth, OAuthLoginError } from "~/lib/bskyOAuth";

const makeFakeSession = (overrides: Record<string, unknown> = {}) => ({
  sub: "did:plc:abc123",
  serverMetadata: { issuer: "https://bsky.social" },
  fetchHandler: vi.fn(),
  signOut: vi.fn(),
  ...overrides,
});

describe("loginWithOAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: Agent.prototype.getProfile resolves with a handle.
    // Individual tests can override this.
    vi.spyOn(Agent.prototype, "getProfile").mockResolvedValue({
      data: { handle: "alice.bsky.social" },
    } as never);
  });

  it("returns agent, sub and handle on success", async () => {
    const session = makeFakeSession();
    vi.mocked(expoOAuthClient.signIn).mockResolvedValue(session as never);

    const result = await loginWithOAuth("alice.bsky.social");

    expect(result.sub).toBe("did:plc:abc123");
    expect(result.handle).toBe("alice.bsky.social");
    expect(result.agent).toBeInstanceOf(Agent);
  });

  it("passes the OAuthSession directly to Agent constructor", async () => {
    const session = makeFakeSession();
    vi.mocked(expoOAuthClient.signIn).mockResolvedValue(session as never);

    const result = await loginWithOAuth("alice.bsky.social");

    expect((result.agent as unknown as { sessionManager: unknown }).sessionManager).toBe(session);
  });

  it("throws OAuthLoginError code=unknown when sub is empty", async () => {
    vi.mocked(expoOAuthClient.signIn).mockResolvedValue(
      makeFakeSession({ sub: "" }) as never,
    );

    await expect(loginWithOAuth("alice.bsky.social")).rejects.toMatchObject({
      name: "OAuthLoginError",
      code: "unknown",
    });
  });

  it("normalizes handle resolution errors", async () => {
    vi.mocked(expoOAuthClient.signIn).mockRejectedValue(
      new Error("Unable to resolve handle"),
    );

    await expect(loginWithOAuth("bad.handle")).rejects.toMatchObject({
      code: "handle_resolution_failed",
    });
  });

  it("normalizes cancelled as code=cancelled", async () => {
    vi.mocked(expoOAuthClient.signIn).mockRejectedValue(
      new Error("User cancelled the authentication flow"),
    );

    await expect(loginWithOAuth("alice.bsky.social")).rejects.toMatchObject({
      code: "cancelled",
    });
  });

  it("normalizes network errors", async () => {
    vi.mocked(expoOAuthClient.signIn).mockRejectedValue(
      new TypeError("Network request failed"),
    );

    await expect(loginWithOAuth("alice.bsky.social")).rejects.toMatchObject({
      code: "network",
    });
  });

  it("falls back to code=unknown for unrecognized errors", async () => {
    vi.mocked(expoOAuthClient.signIn).mockRejectedValue(
      new Error("something weird"),
    );

    await expect(loginWithOAuth("alice.bsky.social")).rejects.toMatchObject({
      code: "unknown",
    });
  });

  it("throws OAuthLoginError when getProfile fails", async () => {
    vi.mocked(expoOAuthClient.signIn).mockResolvedValue(
      makeFakeSession() as never,
    );
    vi.spyOn(Agent.prototype, "getProfile").mockRejectedValue(
      new TypeError("Network request failed"),
    );

    await expect(loginWithOAuth("alice.bsky.social")).rejects.toBeInstanceOf(
      OAuthLoginError,
    );
  });
});
