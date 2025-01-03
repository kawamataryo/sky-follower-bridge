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

export const scrapeListNameFromPage = (): string => {
  const listNameElement = document.querySelector(
    'div[aria-label="Timeline: List"] span',
  );
  if (listNameElement) {
    return listNameElement.textContent.trim();
  }
  return "Imported List from X";
};

export const searchUserCells = (userCell: HTMLElement): HTMLElement[] => {
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
