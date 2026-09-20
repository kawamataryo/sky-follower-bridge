/** Instagram opens relationship lists without changing the profile URL. */
export function getInstagramList() {
  for (const dialog of document.querySelectorAll<HTMLElement>(
    '[role="dialog"]',
  )) {
    if (
      dialog.getAttribute("aria-hidden") === "true" ||
      !dialog.querySelector('[role="heading"], h1, h2') ||
      !dialog.querySelector('input[type="text"], input[type="search"]')
    ) {
      continue;
    }
    // The outer dialog also has overflow styles. Only the list viewport excludes
    // the search box. Do not require overflow: short/empty lists are valid too.
    const viewport = Array.from(
      dialog.querySelectorAll<HTMLElement>("div"),
    ).find(
      (element) =>
        !element.querySelector("input") &&
        ["auto", "scroll"].includes(getComputedStyle(element).overflowY),
    );
    const list = viewport?.firstElementChild as HTMLElement | null;
    if (viewport && list) {
      // Instagram renders suggestions as subsequent siblings of this list.
      return { dialog, viewport, list };
    }
  }
  return null;
}

function profileName(link: Element): string {
  const href = link.getAttribute("href") ?? "";
  try {
    const url = new URL(href, "https://www.instagram.com");
    if (url.origin !== "https://www.instagram.com") return "";
    return /^\/(\w[\w.]*|\.[\w.]+)\/?$/.exec(url.pathname)?.[1] ?? "";
  } catch {
    return "";
  }
}

function isNamedProfileLink(link: HTMLAnchorElement): boolean {
  const username = profileName(link);
  return (
    !!username &&
    (link.innerText?.trim() === username ||
      link.textContent?.trim() === username ||
      Array.from(link.querySelectorAll("span")).some(
        (span) => span.textContent?.trim() === username,
      ))
  );
}

export function getInstagramRows(list: HTMLElement): HTMLElement[] {
  const rows = new Set<HTMLElement>();
  for (const link of list.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    const username = profileName(link);
    if (!isNamedProfileLink(link)) continue;
    // Start at the named link, not the avatar (which can be a story button).
    let row = link.parentElement;
    while (row && row !== list && !row.querySelector("img")) {
      row = row.parentElement;
    }
    if (!row || row === list) continue;
    const names = Array.from(row.querySelectorAll("a[href]"))
      .map(profileName)
      .filter(Boolean);
    if (names.every((name) => name === username)) rows.add(row);
  }
  return Array.from(rows);
}

export function readInstagramRow(row: Element) {
  const link = Array.from(
    row.querySelectorAll<HTMLAnchorElement>("a[href]"),
  ).find(isNamedProfileLink);
  const username = link ? profileName(link) : "";
  let displayName = "";
  // The display name is a sibling of the username section. That section may
  // also contain verification badges and an inline Follow button.
  let section = link?.parentElement;
  while (section && section !== row) {
    const name = Array.from(section.children).find(
      (child) =>
        child.tagName === "SPAN" &&
        !child.contains(link) &&
        !child.matches('[role="button"], [role="link"]') &&
        !child.querySelector('a, button, [role="button"], [role="link"]') &&
        child.textContent?.trim() &&
        !/^[·•]$/.test(child.textContent.trim()),
    );
    if (name) {
      displayName = name.textContent?.trim() ?? "";
      break;
    }
    section = section.parentElement;
  }
  return {
    username,
    displayName,
    avatar: row.querySelector("img")?.getAttribute("src") ?? "",
  };
}
