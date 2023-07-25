export const MESSAGE_NAMES = {
  SEARCH_BSKY_USER: "search_bsky_user"
}

const STORAGE_PREFIX = "sky_follower_bridge_storage"
export const STORAGE_KEYS = {
  BSKY_USER_ID: `${STORAGE_PREFIX}_bsky_password`,
  BSKY_PASSWORD: `${STORAGE_PREFIX}_bsky_user`,
}

export const TARGET_URLS_REGEX = [
  /^https:\/\/twitter\.com\/[^/]+\/following$/,
  /^https:\/\/twitter\.com\/[^/]+\/followers$/,
  /^https:\/\/x\.com\/[^/]+\/following$/,
  /^https:\/\/x\.com\/[^/]+\/followers$/,
]

export const MESSAGE_TYPE = {
  ERROR: "error",
  SUCCESS: "success",
} as const
