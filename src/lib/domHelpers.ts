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
  const [avatarEl, displayNameEl] = userCell.querySelectorAll("a");
  const twAccountName = avatarEl?.getAttribute("href")?.replace("/", "");
  const twAccountNameRemoveUnderscore = twAccountName.replaceAll("_", ""); // bsky does not allow underscores in handle, so remove them.
  const twAccountNameReplaceUnderscore = twAccountName.replaceAll("_", "-");
  const twDisplayName = displayNameEl?.textContent;
  return {
    twAccountName,
    twDisplayName,
    twAccountNameRemoveUnderscore,
    twAccountNameReplaceUnderscore,
  };
};
