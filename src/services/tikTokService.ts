import { searchUserCells } from "~lib/domHelpers";
import { findFirstScrollableElements } from "~lib/utils";
import type { CrawledUserInfo, IService, MessageName } from "~types";

const SCROLL_TARGET_SELECTOR = '[data-e2e="follow-info-popup"]';

export class TikTokService implements IService {
  messageName: MessageName;
  crawledUserCells: Set<HTMLElement>;

  constructor(messageName: MessageName) {
    this.messageName = messageName;
    this.crawledUserCells = new Set();
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
        user.originalAvatarDataUrl = base64Url;
      } catch (error) {
        console.error("Failed to convert avatar to base64:", error);
      }
    }
    return user;
  }

  isTargetPage(): [boolean, string] {
    const isTargetPage = document.querySelector(SCROLL_TARGET_SELECTOR);
    if (!isTargetPage) {
      return [false, chrome.i18n.getMessage("error_invalid_page_in_threads")];
    }
    return [true, ""];
  }

  extractUserData(userCell: Element): CrawledUserInfo {
    const [displayName, _accountName] =
      (userCell as HTMLElement).innerText
        ?.split("\n")
        .map((t) => t.trim())
        .filter((t) => t) ?? [];
    const accountName = _accountName.replaceAll(".", "");
    const accountNameRemoveUnderscore = accountName.replaceAll("_", ""); // bsky does not allow underscores in handle, so remove them.
    const accountNameReplaceUnderscore = accountName.replaceAll("_", "-");
    const avatarElement = userCell.querySelector('[shape="circle"]>img');
    const avatarSrc = avatarElement?.getAttribute("src") ?? "";

    const user = {
      accountName,
      displayName,
      accountNameRemoveUnderscore,
      accountNameReplaceUnderscore,
      bskyHandleInDescription: "",
      originalAvatar: avatarSrc,
      originalAvatarDataUrl: "",
      originalProfileLink: `https://www.tiktok.com/@${_accountName}`,
    };
    return user;
  }

  getCrawledUsers(): CrawledUserInfo[] {
    const userCells = searchUserCells(
      document.querySelector(SCROLL_TARGET_SELECTOR),
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
