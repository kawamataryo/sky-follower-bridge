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
