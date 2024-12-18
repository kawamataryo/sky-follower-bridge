import { findFirstScrollableElements, wait } from "~lib/utils";
import type { CrawledUserInfo } from "~types";
import { AbstractService } from "./abstractService";

export class TikTokService extends AbstractService {
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
    const isTargetPage = document.querySelector(
      '[data-e2e="follow-info-popup"]',
    );
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
      bskyHandle: "",
      originalAvatar: avatarSrc,
      originalProfileLink: `https://www.tiktok.com/@${_accountName}`,
    };
    return user;
  }

  async performScrollAndCheckEnd(): Promise<boolean> {
    const scrollTarget = findFirstScrollableElements(
      document.querySelector('[data-e2e="follow-info-popup"]') as HTMLElement,
    );

    if (!scrollTarget) {
      return true;
    }

    const initialScrollHeight = scrollTarget.scrollHeight;
    scrollTarget.scrollTop += initialScrollHeight + 1000;

    await wait(3000);

    const hasReachedEnd =
      scrollTarget.scrollTop + scrollTarget.clientHeight >=
      scrollTarget.scrollHeight;

    return hasReachedEnd;
  }
}
