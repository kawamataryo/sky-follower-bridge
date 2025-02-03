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
  crawledUserCells: Set<HTMLElement>;

  constructor(messageName: MessageName) {
    // Set the list name in the storage if it's a list members page
    if (messageName === MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE) {
      const listName = scrapeListNameFromPage();
      new Storage({
        area: "local",
      }).set(STORAGE_KEYS.LIST_NAME, listName);
    }
    this.messageName = messageName;
    this.crawledUserCells = new Set();
  }

  // X determines the target page based on the URL on the popup side, so it always returns true
  isTargetPage(): [boolean, string] {
    return [true, ""];
  }

  async processExtractedData(user: CrawledUserInfo): Promise<CrawledUserInfo> {
    const avatarUrl = user.originalAvatar;
    if (avatarUrl) {
      try {
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Url = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        user.originalAvatar = base64Url;
      } catch (error) {
        console.error("Failed to convert avatar to base64:", error);
      }
    }
    return user;
  }

  extractUserData(userCell: Element): CrawledUserInfo {
    const anchors = Array.from(userCell.querySelectorAll("a"));
    const [avatarEl, displayNameEl] = anchors;
    const accountName = avatarEl?.getAttribute("href")?.replace("/", "");
    const accountNameRemoveUnderscore = accountName.replaceAll("_", ""); // bsky does not allow underscores in handle, so remove them.
    const accountNameReplaceUnderscore = accountName.replaceAll("_", "-");
    const displayName = displayNameEl?.textContent;
    const bskyHandleInDescription =
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
      bskyHandleInDescription,
      originalAvatar,
      originalProfileLink: `https://x.com/${accountName}`,
    };
  }

  getCrawledUsers(): CrawledUserInfo[] {
    const userCells = document.querySelectorAll(
      USER_CELL_SELECTOR_MAP[this.messageName],
    );

    let newUserCellsSet: Set<HTMLElement>;

    if (
      typeof this.crawledUserCells.difference === "function" &&
      typeof this.crawledUserCells.union === "function"
    ) {
      newUserCellsSet = new Set(userCells).difference(this.crawledUserCells);
      this.crawledUserCells = this.crawledUserCells.union(newUserCellsSet);
    } else {
      newUserCellsSet = new Set(
        Array.from(userCells).filter(
          (userCell) => !this.crawledUserCells.has(userCell),
        ),
      );
      for (const userCell of newUserCellsSet) {
        this.crawledUserCells.add(userCell);
      }
    }

    const newUserCells = Array.from(newUserCellsSet);

    return newUserCells.map((userCell) => this.extractUserData(userCell));
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
