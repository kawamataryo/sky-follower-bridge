export const BSKY_USER_MATCH_TYPE = {
  HANDLE: "handle",
  DISPLAY_NAME: "display_name",
  DESCRIPTION: "description",
  NONE: "none",
} as const;

export const BSKY_PROFILE_LABEL = {
  IMPERSONATION: "impersonation",
} as const;

export const BSKY_DOMAIN = "bsky.social";

export const X_FOLLOW_PAGE_URL = "https://x.com/following";
export const X_LOGIN_URL = "https://x.com/i/flow/login";

export const USER_CELL_SELECTOR =
  '[data-testid="primaryColumn"] [data-testid="UserCell"]';

export const SCAN_BATCH_SIZE = 10;
export const SCAN_BATCH_DELAY_MS = 300;
export const SCROLL_END_CHECK_DELAY_MS = 8000;

export const SECURE_STORE_KEYS = {
  SESSION: "sky_follower_bridge_session",
} as const;
