export const debugLog = (...messages: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔷 [Sky Follower Bridge]");
    console.log(...messages);
  }
};

export const isOneSymbol = (str: string) => {
  return /^[^\w\s]$/.test(str);
};

export const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const findFirstScrollableElements = (
  targetElement: HTMLElement,
): HTMLElement | null => {
  const isScrollable = (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    const isOverflowScrollable =
      style.overflowY === "auto" || style.overflowY === "scroll";
    const canScrollVertically = element.scrollHeight > element.clientHeight;

    return isOverflowScrollable && canScrollVertically;
  };

  const allElements = targetElement.querySelectorAll("*");
  const scrollableElements: HTMLElement[] = [];

  for (const element of allElements) {
    const htmlElement = element as HTMLElement;
    if (isScrollable(htmlElement)) {
      scrollableElements.push(htmlElement);
    }
  }

  return scrollableElements[0] ?? null;
};

export const isFirefox = () => {
  return navigator.userAgent.toLowerCase().includes("firefox");
};

export const getMessageWithLink = (
  key: string,
  placeholders: string[] = [],
) => {
  const linkPattern = /\[(.*?)\]\((.*?)\)/g;
  let message = chrome.i18n.getMessage(key, placeholders);
  const links = message.matchAll(linkPattern);
  for (const link of links) {
    const [fullMatch, text, url] = link;
    message = message.replace(
      fullMatch,
      `<a href="${url}" target="_blank" class="link" rel="noreferrer">${text}</a>`,
    );
  }

  return message;
};
