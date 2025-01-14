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

export const createSearchBlueskyButton = () => {
  const button = document.createElement("button");
  button.id = "bsky-search-button";
  button.textContent = "🦋 Search Bluesky User";

  // Set button styles
  Object.assign(button.style, {
    padding: "4px 8px",
    fontWeight: "bold",
    width: "fit-content",
    fontFamily:
      "-apple-system, 'system-ui', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    cursor: "pointer",
    borderRadius: "9999px",
    background: "rgb(32, 139, 254)",
    transition: "background 0.3s ease",
    fontSize: "12px",
    color: "white",
    border: "none",
  });

  // Add hover effects
  button.onmouseover = () => {
    button.style.background = "rgb(76, 162, 254)";
  };
  button.onmouseout = () => {
    button.style.background = "rgb(32, 139, 254)";
  };

  return button;
};
