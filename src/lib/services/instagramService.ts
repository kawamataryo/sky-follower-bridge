import { findFirstScrollableElements } from "~lib/utils";
import type { CrawledUserInfo, IService, MessageName } from "~types";

const SCROLL_TARGET_SELECTOR = '[role="dialog"]';

const searchUserCells = (userCell: HTMLElement): HTMLElement[] => {
  if (!userCell) {
    return [];
  }
  const cellTextCount = (userCell.innerText ?? "").split("\n").length;
  const hasAvatar = !!userCell.querySelector("img");
  if (1 <= cellTextCount && cellTextCount <= 3 && hasAvatar) {
    return [userCell];
  }
  if (userCell.children.length === 0) {
    return [];
  }
  return Array.from(userCell.children).flatMap(searchUserCells);
};

export class InstagramService implements IService {
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
      } catch (error) {
        console.error("Failed to convert avatar to base64:", error);
      }
    }
    return user;
  }

  isTargetPage(): [boolean, string] {
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
      originalProfileLink: `https://www.instagram.com/${_accountName}`,
    };
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
