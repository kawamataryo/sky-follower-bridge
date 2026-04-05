import { describe, expect, it } from "vitest";
import { buildSearchTerms } from "~/lib/fuzzySearch";

describe("buildSearchTerms", () => {
  it("returns unique non-symbol terms in priority order", () => {
    const terms = buildSearchTerms({
      bskyHandleInDescription: "alice.bsky.social",
      accountNameRemoveUnderscore: "alice",
      accountNameReplaceUnderscore: "alice",
      displayName: "Alice Smith",
      accountName: "alice",
      originalAvatar: "",
      originalProfileLink: "",
    });

    expect(terms).toEqual(["alice.bsky.social", "alice", "Alice Smith"]);
  });

  it("filters out single symbol characters", () => {
    const terms = buildSearchTerms({
      bskyHandleInDescription: "",
      accountNameRemoveUnderscore: "!",
      accountNameReplaceUnderscore: "@",
      displayName: "Bob",
      accountName: "bob",
      originalAvatar: "",
      originalProfileLink: "",
    });

    expect(terms).toEqual(["Bob"]);
  });

  it("filters out empty strings", () => {
    const terms = buildSearchTerms({
      bskyHandleInDescription: "",
      accountNameRemoveUnderscore: "",
      accountNameReplaceUnderscore: "",
      displayName: "Carol",
      accountName: "carol",
      originalAvatar: "",
      originalProfileLink: "",
    });

    expect(terms).toEqual(["Carol"]);
  });
});
