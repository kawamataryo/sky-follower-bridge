import { MESSAGE_NAMES } from "~lib/constants";
import { BSKY_DOMAIN, MESSAGE_NAME_TO_QUERY_PARAM_MAP } from "~lib/constants";
import { wait } from "~lib/utils";
import { AbstractService } from "./abstractService";
import type { CrawledUserInfo } from "~types";

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

    return {
      accountName,
      displayName,
      accountNameRemoveUnderscore,
      accountNameReplaceUnderscore,
      bskyHandle,
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
