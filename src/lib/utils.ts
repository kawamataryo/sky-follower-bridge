export const debugLog = (message: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`🔷 [Sky Follower Bridge] ${message}`);
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
