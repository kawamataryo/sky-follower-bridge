export const MESSAGE_NAMES = {
  SEARCH_BSKY_USER_ON_FOLLOW_PAGE: "search_bsky_user_on_follow_page",
  SEARCH_BSKY_USER_ON_BLOCK_PAGE: "search_bsky_user_on_block_page",
  SEARCH_BSKY_USER_ON_MUTE_PAGE: "search_bsky_user_on_mute_page",
}

const STORAGE_PREFIX = "sky_follower_bridge_storage"
export const STORAGE_KEYS = {
  BSKY_USER_ID: `${STORAGE_PREFIX}_bsky_password`,
  BSKY_PASSWORD: `${STORAGE_PREFIX}_bsky_user`,
}

export const TARGET_URLS_REGEX = {
  FOLLOW: /^https:\/\/(twitter|x)\.com\/[^/]+\/follow/,
  BLOCK: /^https:\/\/(twitter|x)\.com\/settings\/blocked\//,
  MUTE: /^https:\/\/(twitter|x)\.com\/settings\/muted\//,
}

export const MESSAGE_TYPE = {
  ERROR: "error",
  SUCCESS: "success",
} as const
