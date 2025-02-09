import consola from "consola";
import type { CrawledUserInfo, IService, MessageName } from "~types";

export class FacebookService implements IService {
  messageName: MessageName;
  crawledUserCells: Set<HTMLElement>;

  constructor(messageName: MessageName) {
    this.messageName = messageName;
    this.crawledUserCells = new Set();
  }

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
        user.originalAvatarDataUrl = base64Url;
      } catch (error) {
        console.error("Failed to convert avatar to base64:", error);
      }
    }
    return user;
  }

  extractUserData(userCell: HTMLLinkElement): CrawledUserInfo {
    const profileUrl = userCell.href;
    const displayName =
      userCell.querySelector("svg[aria-label]")?.getAttribute("aria-label") ||
      userCell.querySelector("span")?.textContent?.trim() ||
      "";
    const originalAvatar =
      userCell.querySelector("svg image")?.getAttribute("xlink:href") ||
      userCell.querySelector("svg image")?.getAttribute("href") ||
      "";
    const pathname = new URL(profileUrl).pathname;
    const accountName = !pathname.includes("profile.php")
      ? pathname.replace(/^\//, "")
      : "";

    consola.info(accountName, displayName, originalAvatar);

    return {
      accountName,
      displayName,
      accountNameRemoveUnderscore: "",
      accountNameReplaceUnderscore: "",
      bskyHandleInDescription: "",
      originalAvatar,
      originalAvatarDataUrl: "",
      originalProfileLink: profileUrl,
    };
  }

  getCrawledUsers(): CrawledUserInfo[] {
    const userCells = Array.from(
      document.querySelectorAll<HTMLLinkElement>('a[role="link"]'),
    ).filter((userCell) => {
      return userCell.querySelector("svg[aria-label]") !== null;
    });

    let newUserCellsSet: Set<HTMLLinkElement>;

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
    const divs = document.querySelectorAll("div");
    for (const div of divs) {
      const style = window.getComputedStyle(div);
      const overflowY = style.overflowY;
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        div.scrollHeight > div.clientHeight
      ) {
        return div;
      }
    }
    return document.documentElement;
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
