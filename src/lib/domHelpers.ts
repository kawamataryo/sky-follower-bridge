import type { CrawledUserInfo } from "~types";
import { BSKY_DOMAIN } from "./constants";

export const getUserCells = ({
  queryParam,
  filterInsertedElement,
}: { queryParam: string; filterInsertedElement: boolean }) => {
  const userCells = document.querySelectorAll(queryParam);

  // filter out already inserted elements
  if (filterInsertedElement) {
    return Array.from(userCells).filter((userCell) => {
      const nextElement = userCell.nextElementSibling;
      if (!nextElement) {
        return true;
      }
      return (
        nextElement.classList.contains("bsky-user-content-wrapper") === false
      );
    });
  }
  return Array.from(userCells);
};

export const extractUserData = (userCell: Element): CrawledUserInfo => {
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
};
