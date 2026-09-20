import { beforeEach, describe, expect, it } from "vitest";
import { MESSAGE_NAMES, TARGET_URLS_REGEX } from "../../lib/constants";
import { getInstagramList } from "../instagramDom";
import { InstagramService } from "../instagramService";

const row = (username: string, name = "", verified = false) => `
<div><div><img src="https://example.com/avatar.jpg"></div>
<div><div><a href="/${username}/"><span>${username}</span>${verified ? "<svg><title>Verified</title></svg>" : ""}</a><span>·</span><button>Follow</button></div>${name ? `<span>${name}</span>` : ""}<div>Suggested for you</div></div>
<div role="button">Remove</div></div>`;
const render = (rows: string, suggestions = "") => {
  document.body.innerHTML = `<div role="dialog"><div role="heading">Followers</div>
<input type="text"><div style="overflow-y: auto" id="viewport"><div id="list"><div>${rows}</div></div>${suggestions ? `<div>Suggested for you</div><div>${suggestions}</div>` : ""}</div></div>`;
};
const service = () =>
  new InstagramService(MESSAGE_NAMES.SEARCH_BSKY_USER_ON_INSTAGRAM_PAGE);

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("Instagram profile URLs", () => {
  it.each([
    "alice/",
    "alice",
    "alice/following/",
    "alice/followers",
    "alice/?hl=ja",
    "alice/following/?hl=en",
    "a.b_c/#test",
  ])("accepts %s", (path) => {
    expect(
      TARGET_URLS_REGEX.INSTAGRAM.test(`https://www.instagram.com/${path}`),
    ).toBe(true);
  });
  it.each([
    "",
    "explore/",
    "accounts/",
    "direct/inbox/",
    "p/123/",
    "reels/",
    "alice/tagged/",
    "alice/following/extra",
  ])("rejects %s", (path) => {
    expect(
      TARGET_URLS_REGEX.INSTAGRAM.test(`https://www.instagram.com/${path}`),
    ).toBe(false);
  });
  it("rejects other hosts", () => {
    expect(
      TARGET_URLS_REGEX.INSTAGRAM.test(
        "https://www.instagram.com.evil.test/alice/",
      ),
    ).toBe(false);
  });
});

describe("Instagram relationship lists", () => {
  it("requires an open list, not a profile or an unrelated dialog", () => {
    expect(service().isTargetPage()[0]).toBe(false);
    document.body.innerHTML =
      '<div role="dialog"><button>Settings</button></div>';
    expect(service().isTargetPage()[0]).toBe(false);
    expect(service().getCrawledUsers()).toEqual([]);
    expect(service().getScrollTarget()).toBeNull();
    expect(service().checkEnd()).toBe(true);
  });
  it("detects empty/non-overflowing lists without depending on heading language", () => {
    render("");
    expect(service().isTargetPage()[0]).toBe(true);
    expect(service().getCrawledUsers()).toEqual([]);
  });
  it("extracts named profile links, preserves display names and excludes suggestions", () => {
    render(
      row("a.b_c", "Alice", true) + row("no_name"),
      row("suggested", "Someone"),
    );
    const users = service().getCrawledUsers();
    expect(users).toHaveLength(2);
    expect(users[0]).toMatchObject({
      accountName: "ab_c",
      accountNameRemoveUnderscore: "abc",
      accountNameReplaceUnderscore: "ab-c",
      displayName: "Alice",
      originalProfileLink: "https://www.instagram.com/a.b_c",
    });
    expect(users[1].displayName).toBe("");
  });
  it.each([
    "/a.b_c/?hl=ja",
    "https://www.instagram.com/a.b_c/?hl=ja#profile",
  ])("extracts localized profile links: %s", (href) => {
    render(row("a.b_c", "Alice", true).replaceAll("/a.b_c/", href));
    expect(service().getCrawledUsers()).toMatchObject([
      {
        accountName: "ab_c",
        displayName: "Alice",
        originalProfileLink: "https://www.instagram.com/a.b_c",
      },
    ]);
  });
  it("ignores profile-like links to other hosts", () => {
    render(
      row("alice").replaceAll("/alice/", "https://example.com/alice/?hl=ja"),
    );
    expect(service().getCrawledUsers()).toEqual([]);
  });
  it("does not reprocess accounts after DOM rerenders, but picks up new rows", () => {
    render(row("first", "First"));
    const s = service();
    expect(s.getCrawledUsers()).toHaveLength(1);
    render(row("first", "First") + row("second", "Second"));
    expect(s.checkEnd()).toBe(false);
    expect(s.getCrawledUsers().map((u) => u.accountName)).toEqual(["second"]);
    expect(s.getCrawledUsers()).toEqual([]);
  });
  it("scrolls only the list viewport and waits for pending rows/loading", async () => {
    render(row("first", "First"));
    const s = service();
    const viewport = getInstagramList().viewport;
    Object.defineProperty(viewport, "scrollHeight", { value: 600 });
    s.getCrawledUsers();
    await s.scrollToBottom();
    expect(viewport.scrollTop).toBe(600);
    expect(document.documentElement.scrollTop).toBe(0);
    expect(s.checkEnd()).toBe(true);
    getInstagramList().list.insertAdjacentHTML(
      "beforeend",
      '<div role="progressbar"></div>',
    );
    expect(s.checkEnd()).toBe(false);
  });
  it("ignores hidden dialogs", () => {
    render(row("first"));
    document
      .querySelector('[role="dialog"]')
      .setAttribute("aria-hidden", "true");
    expect(service().isTargetPage()[0]).toBe(false);
  });
});
