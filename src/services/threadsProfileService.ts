import { BSKY_DOMAIN } from "~lib/constants";
import { debugLog } from "~lib/utils";
import type { CrawledUserInfo, IProfileService } from "~types";

const SEARCH_BLUESKY_BUTTON_ID = "bsky-search-button";

const PROFILE_AREA_SELECTOR = '[aria-label="Column body"] > div > div';

export class ThreadsProfileService implements IProfileService {
  isTargetPage() {
    const url = window.location.href;
    const profileAreaElement = document.querySelector<HTMLDivElement>(
      PROFILE_AREA_SELECTOR,
    );
    const profileAreaElementExists =
      profileAreaElement !== null &&
      profileAreaElement.querySelector("h1") !== null;
    debugLog(profileAreaElement);
    return (
      url.startsWith("https://www.threads.net/@") && profileAreaElementExists
    );
  }

  extractData(): Omit<
    CrawledUserInfo,
    "originalAvatar" | "originalProfileLink"
  > {
    const profileAreaElement = document.querySelector<HTMLDivElement>(
      PROFILE_AREA_SELECTOR,
    );
    const profileAreaText = profileAreaElement?.innerText ?? "";
    const [_, displayName, accountName] = profileAreaText.split("\n");
    const bioText = profileAreaText.split("\n").slice(3).join("\n");
    const accountNameRemoveUnderscore = accountName.replaceAll("_", "");
    const accountNameReplaceUnderscore = accountName.replaceAll("_", "-");
    const bskyHandleInDescription =
      bioText?.match(new RegExp(`([^/\\s]+\\.${BSKY_DOMAIN})`))?.[1] ??
      bioText
        ?.match(/bsky\.app\/profile\/([^/\s]+)…?/)?.[1]
        ?.replace("…", "") ??
      "";

    return {
      displayName,
      accountName,
      accountNameRemoveUnderscore,
      accountNameReplaceUnderscore,
      bskyHandleInDescription,
    };
  }

  hasSearchBlueskyButton() {
    return document.getElementById(SEARCH_BLUESKY_BUTTON_ID) !== null;
  }

  removeSearchBlueskyButton() {
    const button = document.getElementById(SEARCH_BLUESKY_BUTTON_ID);
    if (button) {
      button.remove();
    }
  }

  createSearchBlueskyButton() {
    const button = document.createElement("button");
    button.id = SEARCH_BLUESKY_BUTTON_ID;
    button.textContent = chrome.i18n.getMessage("findSimilarBlueskyUsers");

    // Set button styles
    const buttonBackground = "oklch(0.488198 0.217165 264.376)";
    const buttonHoverBackground = "oklab(0.439378 -0.0191538 -0.194508)";
    Object.assign(button.style, {
      padding: "4px 8px",
      fontWeight: "bold",
      width: "fit-content",
      fontFamily:
        "-apple-system, 'system-ui', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      cursor: "pointer",
      borderRadius: "9999px",
      background: buttonBackground,
      transition: "background 0.3s ease",
      fontSize: "12px",
      color: "white",
      border: "none",
      marginBottom: "0px",
    });

    // Add hover effects
    button.onmouseover = () => {
      button.style.background = buttonHoverBackground;
    };
    button.onmouseout = () => {
      button.style.background = buttonBackground;
    };

    return button;
  }

  mountSearchBlueskyButton({
    clickAction,
  }: {
    clickAction: (
      userData: Omit<CrawledUserInfo, "originalAvatar" | "originalProfileLink">,
    ) => void;
  }) {
    this.removeSearchBlueskyButton();
    const button = this.createSearchBlueskyButton();
    button.onclick = () => {
      const userData = this.extractData();
      clickAction(userData);
    };
    const userNameElement = document.querySelector(
      `${PROFILE_AREA_SELECTOR} > div`,
    );
    userNameElement?.parentElement?.insertBefore(button, userNameElement);
  }
}
