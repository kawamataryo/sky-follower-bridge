import { MESSAGE_NAMES } from "~lib/constants";
import { BSKY_DOMAIN } from "~lib/constants";
import { wait } from "~lib/utils";
import type { CrawledUserInfo } from "~types";
import { AbstractService } from "./abstractService";

export class XService extends AbstractService {
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

  async performScrollAndCheckEnd(): Promise<boolean> {
    const isListMembersPage =
      this.messageName === MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE;

    const scrollTarget = isListMembersPage
      ? (document.querySelector('div[data-viewportview="true"]') as HTMLElement)
      : document.documentElement;

    const initialScrollHeight = scrollTarget.scrollHeight;
    scrollTarget.scrollTop += initialScrollHeight;

    await wait(3000);

    const hasReachedEnd =
      scrollTarget.scrollTop + scrollTarget.clientHeight >=
      scrollTarget.scrollHeight;

    return hasReachedEnd;
  }
}
