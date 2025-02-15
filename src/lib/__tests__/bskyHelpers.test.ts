import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { describe, expect, it } from "vitest";
import type { CrawledUserInfo } from "~types";
import { isImpersonationUser, isSimilarUser } from "../bskyHelpers";
import { BSKY_PROFILE_LABEL, BSKY_USER_MATCH_TYPE } from "../constants";

describe("bskyHelpers", () => {
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

  const mockCrawledUserInfo = (
    overrides?: Partial<CrawledUserInfo>,
  ): CrawledUserInfo => ({
    accountName: "bar",
    displayName: "bar display name",
    bskyHandleInDescription: "bar",
    originalAvatar: "",
    originalAvatarDataUrl: "",
    originalProfileLink: "",
    accountNameRemoveUnderscore: "bar",
    accountNameReplaceUnderscore: "bar",
    ...overrides,
  });

  describe("isSimilarUser", () => {
    it("should return false when bskyProfile is undefined", () => {
      const result = isSimilarUser(mockCrawledUserInfo(), undefined);
      expect(result.isSimilar).toBe(false);
      expect(result.type).toBe(BSKY_USER_MATCH_TYPE.NONE);
    });

    it("should return true with DESCRIPTION type when bskyHandleInDescription matches", () => {
      const profile = mockProfile({ handle: "match.bsky.social" });
      const result = isSimilarUser(
        mockCrawledUserInfo({ bskyHandleInDescription: "match" }),
        profile,
      );
      expect(result.isSimilar).toBe(true);
      expect(result.type).toBe(BSKY_USER_MATCH_TYPE.DESCRIPTION);
    });

    it("should return true with HANDLE type when account name exactly matches handle", () => {
      const profile = mockProfile({ handle: "testuser.bsky.social" });
      const result = isSimilarUser(
        mockCrawledUserInfo({ accountName: "testuser" }),
        profile,
      );
      expect(result.isSimilar).toBe(true);
      expect(result.type).toBe(BSKY_USER_MATCH_TYPE.HANDLE);
    });

    it("should return true with HANDLE type when account name matches after underscore removal/replacement", () => {
      const profile = mockProfile({ handle: "testuser.bsky.social" });
      const result1 = isSimilarUser(
        mockCrawledUserInfo({
          accountName: "test_user",
          accountNameRemoveUnderscore: "testuser",
        }),
        profile,
      );
      const result2 = isSimilarUser(
        mockCrawledUserInfo({
          accountName: "test_user",
          accountNameReplaceUnderscore: "test-user",
        }),
        profile,
      );
      expect(result1.isSimilar).toBe(true);
      expect(result2.isSimilar).toBe(true);
    });

    it("should return true with HANDLE type when Jaro-Winkler distance is above 0.92", () => {
      const profile = mockProfile({ handle: "alice.bsky.social" });
      const result1 = isSimilarUser(
        mockCrawledUserInfo({ accountName: "alicee" }),
        profile,
      );
      const result2 = isSimilarUser(
        mockCrawledUserInfo({ accountName: "bob" }),
        profile,
      );
      expect(result1.isSimilar).toBe(true);
      expect(result2.isSimilar).toBe(false);
    });

    it("should return true with DISPLAY_NAME type when display names match", () => {
      const profile = mockProfile({ displayName: "Test User" });
      const result = isSimilarUser(
        mockCrawledUserInfo({ displayName: "test user" }),
        profile,
      );
      expect(result.isSimilar).toBe(true);
      expect(result.type).toBe(BSKY_USER_MATCH_TYPE.DISPLAY_NAME);
    });

    it("should return false when no conditions match", () => {
      const profile = mockProfile({
        handle: "nomatch.bsky.social",
        displayName: "No Match",
      });
      const result = isSimilarUser(
        mockCrawledUserInfo({ accountName: "different" }),
        profile,
      );
      expect(result.isSimilar).toBe(false);
    });
  });

  describe("isImpersonationUser", () => {
    it("should return true when IMPERSONATION label exists", () => {
      const profile = mockProfile({
        labels: [
          {
            val: BSKY_PROFILE_LABEL.IMPERSONATION,
            src: "did:plc:official-source",
            uri: "at://did:plc:fake/app.bsky.feed.post/123",
            cts: new Date().toISOString(),
          },
        ],
      });
      expect(isImpersonationUser(profile)).toBe(true);
    });

    it("should return false when no labels exist", () => {
      const profile = mockProfile({ labels: [] });
      expect(isImpersonationUser(profile)).toBe(false);
    });

    it("should return false when only other labels exist", () => {
      const profile = mockProfile({
        labels: [
          {
            val: "other-label",
            src: "did:plc:other-source",
            uri: "at://did:plc:other/app.bsky.feed.post/456",
            cts: new Date().toISOString(),
          },
        ],
      });
      expect(isImpersonationUser(profile)).toBe(false);
    });
  });
});
