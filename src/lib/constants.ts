export const MESSAGE_NAMES = {
  SEARCH_BSKY_USER_ON_FOLLOW_PAGE: "search_bsky_user_on_follow_page",
  SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE:
    "search_bsky_user_on_list_members_page",
  SEARCH_BSKY_USER_ON_BLOCK_PAGE: "search_bsky_user_on_block_page",
} as const;

export const QUERY_PARAMS = {
  FOLLOW: '[data-testid="primaryColumn"] [data-testid="UserCell"]',
  BLOCK: '[data-testid="UserCell"]',
  LIST: '[data-testid="cellInnerDiv"] [data-testid="UserCell"]',
} as const;

export const MESSAGE_NAME_TO_QUERY_PARAM_MAP = {
  [MESSAGE_NAMES.SEARCH_BSKY_USER_ON_FOLLOW_PAGE]: QUERY_PARAMS.FOLLOW,
  [MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE]: QUERY_PARAMS.LIST,
  [MESSAGE_NAMES.SEARCH_BSKY_USER_ON_BLOCK_PAGE]: QUERY_PARAMS.BLOCK,
};

export const ACTION_MODE = {
  FOLLOW: "follow",
  BLOCK: "block",
  IMPORT_LIST: "import_list",
};

export const MESSAGE_NAME_TO_ACTION_MODE_MAP = {
  [MESSAGE_NAMES.SEARCH_BSKY_USER_ON_FOLLOW_PAGE]: ACTION_MODE.FOLLOW,
  [MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE]:
    ACTION_MODE.IMPORT_LIST,
  [MESSAGE_NAMES.SEARCH_BSKY_USER_ON_BLOCK_PAGE]: ACTION_MODE.BLOCK,
};

const STORAGE_PREFIX = "sky_follower_bridge_storage";
export const STORAGE_KEYS = {
  BSKY_USER_ID: `${STORAGE_PREFIX}_bsky_password`,
  BSKY_PASSWORD: `${STORAGE_PREFIX}_bsky_user`,
  BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT: `${STORAGE_PREFIX}_bsky_show_auth_factor_token_input`,
  BSKY_CLIENT_SESSION: `${STORAGE_PREFIX}_bsky_client_session`,
  BSKY_MESSAGE_NAME: `${STORAGE_PREFIX}_bsky_message_name`,
  DETECTED_BSKY_USERS: `${STORAGE_PREFIX}_detected_bsky_users`,
  LIST_NAME: `${STORAGE_PREFIX}_list_name`,
  RENDER_KEY: `${STORAGE_PREFIX}_render_key`,
} as const;

export const TARGET_URLS_REGEX = {
  FOLLOW: /https:\/\/(twitter|x)\.com\/[^/]+\/(verified_follow|follow)/,
  LIST: /^https:\/\/(twitter|x)\.com\/[^/]+\/lists\/[^/]+\/members/,
  BLOCK: /^https:\/\/(twitter|x)\.com\/settings\/blocked/,
} as const;

export const MESSAGE_TYPE = {
  ERROR: "error",
  SUCCESS: "success",
} as const;

export const VIEWER_STATE = {
  BLOCKING: "blocking",
  FOLLOWING: "following",
} as const;

export const BSKY_USER_MATCH_TYPE = {
  HANDLE: "handle",
  DISPLAY_NAME: "display_name",
  DESCRIPTION: "description",
  FOLLOWING: "following",
  NONE: "none",
} as const;

export const MAX_RELOAD_COUNT = 1;

export const MATCH_TYPE_LABEL_AND_COLOR = {
  [BSKY_USER_MATCH_TYPE.HANDLE]: {
    label: "Same handle name",
    color: "info",
  },
  [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: {
    label: "Same display name",
    color: "warning",
  },
  [BSKY_USER_MATCH_TYPE.DESCRIPTION]: {
    label: "Included handle name in description",
    color: "secondary",
  },
  [BSKY_USER_MATCH_TYPE.FOLLOWING]: {
    label: "Followed users",
    color: "success",
  },
};

export const AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE =
  "AuthFactorTokenRequiredError";

export const RATE_LIMIT_ERROR_MESSAGE = "Rate limit";

export const DOCUMENT_LINK = {
  OTHER_ERROR: "https://www.sky-follower-bridge.dev/troubleshooting.html",
  LOGIN_ERROR:
    "https://www.sky-follower-bridge.dev/troubleshooting.html#login-issues",
  TWO_FACTOR_AUTHENTICATION:
    "https://www.sky-follower-bridge.dev/troubleshooting.html#two-factor-authentication-required",
  RATE_LIMIT_ERROR:
    "https://www.sky-follower-bridge.dev/troubleshooting.html#rate-limit-errors",
  PAGE_ERROR:
    "https://www.sky-follower-bridge.dev/troubleshooting.html#page-errors",
} as const;

export const BSKY_DOMAIN =
  process.env.PLASMO_PUBLIC_BSKY_DOMAIN || "bsky.social";

export const BSKY_PROFILE_LABEL = {
  IMPERSONATION: "impersonation",
} as const;

export const DEFAULT_LIST_NAME = "Imported List from X";
