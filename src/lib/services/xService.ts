import { Storage } from "@plasmohq/storage";
import { MESSAGE_NAMES } from "~lib/constants";
import { BSKY_DOMAIN } from "~lib/constants";
import { STORAGE_KEYS } from "~lib/constants";
import { scrapeListNameFromPage } from "~lib/domHelpers";
import type { CrawledUserInfo, IService, MessageName } from "~types";

const USER_CELL_SELECTOR_MAP = {
  [MESSAGE_NAMES.SEARCH_BSKY_USER_ON_FOLLOW_PAGE]:
    '[data-testid="primaryColumn"] [data-testid="UserCell"]',
  [MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE]:
    '[data-testid="cellInnerDiv"] [data-testid="UserCell"]',
  [MESSAGE_NAMES.SEARCH_BSKY_USER_ON_BLOCK_PAGE]: '[data-testid="UserCell"]',
};
const LIST_PAGE_SCROLL_TARGET_SELECTOR = 'div[data-viewportview="true"]';

export class XService implements IService {
  messageName: MessageName;
  crawledUsers: Set<string>;

  constructor(messageName: MessageName) {
    // Set the list name in the storage if it's a list members page
    if (messageName === MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE) {
      const listName = scrapeListNameFromPage();
      new Storage({
        area: "local",
      }).set(STORAGE_KEYS.LIST_NAME, listName);
    }
    this.messageName = messageName;
    this.crawledUsers = new Set();
  }

  // X determines the target page based on the URL on the popup side, so it always returns true
  isTargetPage(): [boolean, string] {
    return [true, ""];
  }

  async processExtractedData(user: CrawledUserInfo): Promise<CrawledUserInfo> {
    return user;
  }

  extractUserData(userCell: Element): CrawledUserInfo {
    const anchors = Array.from(userCell.querySelectorAll("a"));
    const [avatarEl, displayNameEl] = anchors;
    const accountName = avatarEl?.getAttribute("href")?.replace("/", "");
    const accountNameRemoveUnderscore = accountName.replaceAll("_", ""); // bsky does not allow underscores in handle, so remove them.
    const accountNameReplaceUnderscore = accountName.replaceAll("_", "-");
    const displayName = displayNameEl?.textContent;
    const bskyHandle =
      userCell.textContent?.match(
        new RegExp(`([^/\\s]+\\.${BSKY_DOMAIN})`),
      )?.[1] ??
      userCell.textContent
        ?.match(/bsky\.app\/profile\/([^/\s]+)…?/)?.[1]
        ?.replace("…", "") ??
      "";
    const originalAvatar = userCell
      .querySelector('[data-testid^="UserAvatar-Container"]')
      ?.querySelector("img")
      ?.getAttribute("src");

    return {
      accountName,
      displayName,
      accountNameRemoveUnderscore,
      accountNameReplaceUnderscore,
      bskyHandle,
      originalAvatar,
      originalProfileLink: `https://x.com/${accountName}`,
    };
  }

  getCrawledUsers(): CrawledUserInfo[] {
    const userCells = Array.from(
      document.querySelectorAll(USER_CELL_SELECTOR_MAP[this.messageName]),
    );

    const users = Array.from(userCells).map((userCell) =>
      this.extractUserData(userCell),
    );
    const filteredUsers = users.filter((user) => {
      const isNewUser = !this.crawledUsers.has(user.accountName);
      if (isNewUser) {
        this.crawledUsers.add(user.accountName);
      }
      return isNewUser;
    });

    return filteredUsers;
  }

  getScrollTarget() {
    const isListMembersPage =
      this.messageName === MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE;

    return isListMembersPage
      ? document.querySelector<HTMLElement>(LIST_PAGE_SCROLL_TARGET_SELECTOR)
      : document.documentElement;
  }

  async scrollToBottom(): Promise<void> {
    const scrollTarget = this.getScrollTarget();
    if (!scrollTarget) {
      return;
    }

    const initialScrollHeight = scrollTarget.scrollHeight;
    scrollTarget.scrollTop += initialScrollHeight;
  }

  checkEnd(): boolean {
    const scrollTarget = this.getScrollTarget();
    if (!scrollTarget) {
      return true;
    }

    const hasReachedEnd =
      scrollTarget.scrollTop + scrollTarget.clientHeight >=
      scrollTarget.scrollHeight;

    return hasReachedEnd;
  }
}
