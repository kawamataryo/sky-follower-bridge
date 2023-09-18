export const MESSAGE_NAMES = {
  SEARCH_BSKY_USER_ON_FOLLOW_PAGE: "search_bsky_user_on_follow_page",
  SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE: "search_bsky_user_on_list_members_page",
  SEARCH_BSKY_USER_ON_BLOCK_PAGE: "search_bsky_user_on_block_page",
}

const STORAGE_PREFIX = "sky_follower_bridge_storage"
export const STORAGE_KEYS = {
  BSKY_USER_ID: `${STORAGE_PREFIX}_bsky_password`,
  BSKY_PASSWORD: `${STORAGE_PREFIX}_bsky_user`,
} as const

export const TARGET_URLS_REGEX = {
  FOLLOW: /https:\/\/(twitter|x)\.com\/[^/]+\/(verified_follow|follow)/,
  LIST: /^https:\/\/(twitter|x)\.com\/[^/]+\/lists\/[^/]+\/members/,
  BLOCK: /^https:\/\/(twitter|x)\.com\/settings\/blocked/,
} as const

export const MESSAGE_TYPE = {
  ERROR: "error",
  SUCCESS: "success",
} as const

export const VIEWER_STATE = {
  BLOCKING: "blocking",
  FOLLOWING: "following",
} as const


export const BSKY_USER_MATCH_TYPE = {
  HANDLE: "handle",
  DISPLAY_NAME: "display_name",
  DESCRIPTION: "description",
  NONE: "none",
} as const
