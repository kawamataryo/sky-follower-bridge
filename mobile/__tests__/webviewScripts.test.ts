import { describe, expect, it } from "vitest";
import {
  buildScrapeScript,
  parseExtractedUsers,
} from "~/lib/webviewScripts";

describe("parseExtractedUsers", () => {
  it("parses valid user data from WebView message", () => {
    const message = JSON.stringify({
      type: "users",
      payload: [
        {
          accountName: "alice",
          displayName: "Alice",
          accountNameRemoveUnderscore: "alice",
          accountNameReplaceUnderscore: "alice",
          bskyHandleInDescription: "",
          originalAvatar: "https://pbs.twimg.com/photo.jpg",
          originalProfileLink: "https://x.com/alice",
        },
      ],
    });

    const result = parseExtractedUsers(message);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("users");
    if (result!.type === "users") {
      expect(result!.payload).toHaveLength(1);
      expect(result!.payload[0].accountName).toBe("alice");
    }
  });

  it("parses scroll_end message", () => {
    const message = JSON.stringify({ type: "scroll_end" });
    const result = parseExtractedUsers(message);
    expect(result).toEqual({ type: "scroll_end" });
  });

  it("returns null for invalid JSON", () => {
    const result = parseExtractedUsers("not json");
    expect(result).toBeNull();
  });
});

describe("buildScrapeScript", () => {
  it("returns a string containing the UserCell selector", () => {
    const script = buildScrapeScript();
    expect(script).toContain("UserCell");
  });

  it("returns a string containing ReactNativeWebView.postMessage", () => {
    const script = buildScrapeScript();
    expect(script).toContain("ReactNativeWebView.postMessage");
  });

  it("returns a string containing scroll logic", () => {
    const script = buildScrapeScript();
    expect(script).toContain("scrollTop");
    expect(script).toContain("scrollHeight");
  });
});
