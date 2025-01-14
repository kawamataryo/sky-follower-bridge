import { BSKY_DOMAIN } from "~lib/constants";
import type { CrawledUserInfo } from "~types";

const USER_NAME_SELECTOR = '[data-testid="UserName"]';
const SEARCH_BLUESKY_BUTTON_ID = "bsky-search-button";

export class XProfileService {
  isTargetPage() {
    const userNameElement = document.querySelector(USER_NAME_SELECTOR);
    return userNameElement !== null;
  }

  extractData(): Omit<
    CrawledUserInfo,
    "originalAvatar" | "originalProfileLink"
  > {
    const userNameElement =
      document.querySelector<HTMLDivElement>(USER_NAME_SELECTOR);
    const [displayName, accountName] = userNameElement.innerText.split("\n");
    const bioElement = document.querySelector(
      '[data-testid="UserDescription"]',
    );
    const accountNameRemoveUnderscore = accountName.replaceAll("_", ""); // bsky does not allow underscores in account, so remove them.
    const accountNameReplaceUnderscore = accountName.replaceAll("_", "-");
    const bioText = bioElement ? bioElement.textContent : "";
    const userUrl = document.querySelector(
      "[data-testid='UserUrl']",
    )?.textContent;
    const bskyHandleInDescription =
      bioText?.match(new RegExp(`([^/\\s]+\\.${BSKY_DOMAIN})`))?.[1] ??
      bioText
        ?.match(/bsky\.app\/profile\/([^/\s]+)…?/)?.[1]
        ?.replace("…", "") ??
      userUrl?.match(new RegExp(`([^/\\s]+\\.${BSKY_DOMAIN})`))?.[1] ??
      userUrl
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
    return document.getElementById("bsky-search-button") !== null;
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
      marginBottom: "8px",
    });

    // Add hover effects
    button.onmouseover = () => {
      button.style.background = "rgb(76, 162, 254)";
    };
    button.onmouseout = () => {
      button.style.background = "rgb(32, 139, 254)";
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
    console.log("mountSearchBlueskyButton");
    this.removeSearchBlueskyButton();
    const button = this.createSearchBlueskyButton();
    button.onclick = () => {
      const userData = this.extractData();
      console.log("clickAction", userData);
      clickAction(userData);
    };
    const userNameElement = document.querySelector(USER_NAME_SELECTOR);
    userNameElement.parentElement.insertBefore(button, userNameElement);
  }
}
