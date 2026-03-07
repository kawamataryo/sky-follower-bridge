import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAgentGetProfile, mockRestoreOAuthSession } = vi.hoisted(() => ({
  mockAgentGetProfile: vi.fn(),
  mockRestoreOAuthSession: vi.fn(),
}));

vi.mock("@atproto/api", () => {
  class MockAtpAgent {
    session = {};
    pdsUrl = "https://pds.example";
  }

  return {
    Agent: function MockAgent() {
      return {
        getProfile: mockAgentGetProfile,
        session: {},
        pdsUrl: "https://pds.example",
      };
    },
    AtpAgent: MockAtpAgent,
    AtUri: class MockAtUri {},
  };
});

vi.mock("../bskyOAuthClient", () => ({
  restoreOAuthSession: mockRestoreOAuthSession,
}));

import { BskyClient, clearBskyClientCache } from "../bskyClient";

describe("BskyClient", () => {
  beforeEach(() => {
    clearBskyClientCache();
    mockAgentGetProfile.mockReset();
    mockRestoreOAuthSession.mockReset();
  });

  it("restores OAuth clients without relying on agent.session.did", async () => {
    mockRestoreOAuthSession.mockResolvedValue({
      sub: "did:plc:alice",
    });
    mockAgentGetProfile.mockResolvedValue({
      data: {
        handle: "alice.bsky.social",
        displayName: "Alice",
        avatar: "https://example.com/alice.png",
      },
    });

    const client = await BskyClient.createAgentFromSession({
      sub: "did:plc:alice",
    });
    const profile = await client.getMyProfile();

    expect(mockAgentGetProfile).toHaveBeenNthCalledWith(1, {
      actor: "did:plc:alice",
    });
    expect(mockAgentGetProfile).toHaveBeenNthCalledWith(2, {
      actor: "did:plc:alice",
    });
    expect(profile).toEqual({
      pdsUrl: "https://pds.example",
      did: "did:plc:alice",
      handle: "alice.bsky.social",
      displayName: "Alice",
      avatar: "https://example.com/alice.png",
    });
  });
});
