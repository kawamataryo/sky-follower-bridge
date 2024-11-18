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

export const getAccountNameAndDisplayName = (userCell: Element) => {
  const anchors = Array.from(userCell.querySelectorAll("a"));
  const [avatarEl, displayNameEl] = anchors;
  const twAccountName = avatarEl?.getAttribute("href")?.replace("/", "");
  const twAccountNameRemoveUnderscore = twAccountName.replaceAll("_", ""); // bsky does not allow underscores in handle, so remove them.
  const twAccountNameReplaceUnderscore = twAccountName.replaceAll("_", "-");
  const twDisplayName = displayNameEl?.textContent;
  const bskyHandle =
    userCell.textContent?.match(new RegExp(`([^/\\s]+\\.${BSKY_DOMAIN})`))?.[1] ??
    userCell.textContent
      ?.match(/bsky\.app\/profile\/([^/\s]+)…?/)?.[1]
      ?.replace("…", "") ??
    null;

  return {
    twAccountName,
    twDisplayName,
    twAccountNameRemoveUnderscore,
    twAccountNameReplaceUnderscore,
    bskyHandle,
  };
};
