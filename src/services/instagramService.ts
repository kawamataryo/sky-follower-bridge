import type { CrawledUserInfo, IService, MessageName } from "~types";
import {
  getInstagramList,
  getInstagramRows,
  readInstagramRow,
} from "./instagramDom";

export class InstagramService implements IService {
  messageName: MessageName;
  crawledUserCells: Set<HTMLElement>;
  private crawledUserProfiles: Set<string>;

  constructor(messageName: MessageName) {
    this.messageName = messageName;
    this.crawledUserCells = new Set();
    this.crawledUserProfiles = new Set();
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
    return getInstagramList()
      ? [true, ""]
      : [false, chrome.i18n.getMessage("error_invalid_page_in_instagram")];
  }

  extractUserData(userCell: Element): CrawledUserInfo {
    const {
      username: _accountName,
      displayName,
      avatar: avatarSrc,
    } = readInstagramRow(userCell);
    const accountName = _accountName.replaceAll(".", "");
    const accountNameRemoveUnderscore = accountName.replaceAll("_", ""); // bsky does not allow underscores in handle, so remove them.
    const accountNameReplaceUnderscore = accountName.replaceAll("_", "-");

    return {
      accountName,
      displayName,
      accountNameRemoveUnderscore,
      accountNameReplaceUnderscore,
      bskyHandleInDescription: "",
      originalAvatar: avatarSrc,
      originalAvatarDataUrl: "",
      originalProfileLink: `https://www.instagram.com/${_accountName}`,
    };
  }

  getCrawledUsers(): CrawledUserInfo[] {
    const target = getInstagramList();
    if (!target) return [];
    return getInstagramRows(target.list)
      .map((row) => {
        this.crawledUserCells.add(row);
        return this.extractUserData(row);
      })
      .filter((user) => {
        const key = user.originalProfileLink.toLowerCase();
        if (!user.accountName || this.crawledUserProfiles.has(key))
          return false;
        this.crawledUserProfiles.add(key);
        return true;
      });
  }

  getScrollTarget() {
    return getInstagramList()?.viewport ?? null;
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
    const target = getInstagramList();
    if (!target) return true;
    // The caller checks completion after scrolling and waiting for new rows.
    // Give newly loaded rows another pass even if the viewport is at the end.
    if (
      getInstagramRows(target.list).some((row) => {
        const user = this.extractUserData(row);
        return (
          user.accountName &&
          !this.crawledUserProfiles.has(user.originalProfileLink.toLowerCase())
        );
      })
    )
      return false;
    if (target.viewport.querySelector('[role="progressbar"]')) return false;
    const { viewport, list } = target;
    const listBottom = list.getBoundingClientRect().bottom;
    return listBottom <= viewport.getBoundingClientRect().bottom + 1;
  }
}
