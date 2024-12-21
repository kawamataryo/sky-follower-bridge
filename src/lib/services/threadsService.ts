import { findFirstScrollableElements } from "~lib/utils";
import type { CrawledUserInfo, IService, MessageName } from "~types";

const USER_CELL_SELECTOR = '[data-pressable-container="true"]';
const TARGET_PAGE_SELECTOR = '[role="dialog"] [role="tab"]>[role="button"]';
const SCROLL_TARGET_SELECTOR = '[role="dialog"]';

export class ThreadsService implements IService {
  messageName: MessageName;
  crawledUsers: Set<string>;

  constructor(messageName: MessageName) {
    this.messageName = messageName;
    this.crawledUsers = new Set();
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

  isTargetPage(): [boolean, string] {
    const isTargetPage = document.querySelector(TARGET_PAGE_SELECTOR);
    if (!isTargetPage) {
      return [false, chrome.i18n.getMessage("error_invalid_page_in_threads")];
    }
    return [true, ""];
  }

  extractUserData(userCell: Element): CrawledUserInfo {
    const [_accountName, displayName] =
      (userCell as HTMLElement).innerText?.split("\n").map((t) => t.trim()) ??
      [];
    const accountName = _accountName.replaceAll(".", "");
    const accountNameRemoveUnderscore = accountName.replaceAll("_", ""); // bsky does not allow underscores in handle, so remove them.
    const accountNameReplaceUnderscore = accountName.replaceAll("_", "-");
    const avatarElement = userCell.querySelector("img");
    const avatarSrc = avatarElement?.getAttribute("src") ?? "";

    return {
      accountName,
      displayName,
      accountNameRemoveUnderscore,
      accountNameReplaceUnderscore,
      bskyHandle: "",
      originalAvatar: avatarSrc,
      originalProfileLink: `https://www.threads.net/@${_accountName}`,
    };
  }

  getCrawledUsers(): CrawledUserInfo[] {
    const userCells = Array.from(document.querySelectorAll(USER_CELL_SELECTOR));

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
    return findFirstScrollableElements(
      document.querySelector<HTMLElement>(SCROLL_TARGET_SELECTOR),
    );
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
