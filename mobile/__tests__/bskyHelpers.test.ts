import type { AppBskyActorDefs } from "@atproto/api";
import { describe, expect, it } from "vitest";
import type { CrawledUserInfo } from "~/types";
import { isImpersonationUser, isSimilarUser } from "~/lib/bskyHelpers";

type ProfileView = AppBskyActorDefs.ProfileView;

const mockProfile = (overrides: Partial<ProfileView>): ProfileView => ({
  did: "did:plc:mock",
  handle: "foo.bsky.social",
  displayName: "foo display name",
  avatar: "",
  description: "",
  indexedAt: "",
  labels: [],
  ...overrides,
});

const mockCrawledUser = (
  overrides?: Partial<CrawledUserInfo>,
): CrawledUserInfo => ({
  accountName: "bar",
  displayName: "bar display name",
  bskyHandleInDescription: "",
  originalAvatar: "",
  originalProfileLink: "",
  accountNameRemoveUnderscore: "bar",
  accountNameReplaceUnderscore: "bar",
  ...overrides,
});

describe("isSimilarUser", () => {
  it("returns false when profile is undefined", () => {
    const result = isSimilarUser(mockCrawledUser(), undefined);
    expect(result.isSimilar).toBe(false);
    expect(result.type).toBe("none");
  });

  it("matches by description (bsky handle in bio)", () => {
    const result = isSimilarUser(
      mockCrawledUser({ bskyHandleInDescription: "match" }),
      mockProfile({ handle: "match.bsky.social" }),
    );
    expect(result.isSimilar).toBe(true);
    expect(result.type).toBe("description");
  });

  it("matches by exact handle", () => {
    const result = isSimilarUser(
      mockCrawledUser({ accountName: "testuser" }),
      mockProfile({ handle: "testuser.bsky.social" }),
    );
    expect(result.isSimilar).toBe(true);
    expect(result.type).toBe("handle");
  });

  it("matches after underscore removal", () => {
    const result = isSimilarUser(
      mockCrawledUser({
        accountName: "test_user",
        accountNameRemoveUnderscore: "testuser",
      }),
      mockProfile({ handle: "testuser.bsky.social" }),
    );
    expect(result.isSimilar).toBe(true);
    expect(result.type).toBe("handle");
  });

  it("matches by fuzzy handle (Jaro-Winkler > 0.92)", () => {
    const result = isSimilarUser(
      mockCrawledUser({ accountName: "alicee" }),
      mockProfile({ handle: "alice.bsky.social" }),
    );
    expect(result.isSimilar).toBe(true);
    expect(result.type).toBe("handle");
  });

  it("matches by display name (case insensitive)", () => {
    const result = isSimilarUser(
      mockCrawledUser({ displayName: "test user" }),
      mockProfile({ displayName: "Test User" }),
    );
    expect(result.isSimilar).toBe(true);
    expect(result.type).toBe("display_name");
  });

  it("returns false when nothing matches", () => {
    const result = isSimilarUser(
      mockCrawledUser({ accountName: "completely_different" }),
      mockProfile({ handle: "nomatch.bsky.social", displayName: "No Match" }),
    );
    expect(result.isSimilar).toBe(false);
    expect(result.type).toBe("none");
  });
});

describe("isImpersonationUser", () => {
  it("returns true when impersonation label exists", () => {
    const profile = mockProfile({
      labels: [
        {
          val: "impersonation",
          src: "did:plc:src",
          uri: "at://did:plc:fake/post/123",
          cts: new Date().toISOString(),
        },
      ],
    });
    expect(isImpersonationUser(profile)).toBe(true);
  });

  it("returns false when no labels", () => {
    expect(isImpersonationUser(mockProfile({ labels: [] }))).toBe(false);
  });
});
