import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { BSKY_USER_MATCH_TYPE } from "./constants"

export const isSimilarUser = (terms: string[], bskyProfile: ProfileView | undefined): {
  isSimilar: boolean,
  type: typeof BSKY_USER_MATCH_TYPE[keyof typeof BSKY_USER_MATCH_TYPE],
} => {
  if (!bskyProfile) {
    return {
      isSimilar: false,
      type: BSKY_USER_MATCH_TYPE.NONE,
    }
  }

  for (const term of terms) {
    const lowerCaseName = term.toLocaleLowerCase()
    if (lowerCaseName === bskyProfile?.handle.toLocaleLowerCase().replace("@", "").split('.')[0]) {
      return {
        isSimilar: true,
        type: BSKY_USER_MATCH_TYPE.HANDLE,
      }
    }
    if (lowerCaseName === bskyProfile.displayName?.toLocaleLowerCase()) {
      return {
        isSimilar: true,
        type: BSKY_USER_MATCH_TYPE.DISPLAY_NAME,
      }
    }
    if (bskyProfile.description?.toLocaleLowerCase().includes(lowerCaseName)) {
      return {
        isSimilar: true,
        type: BSKY_USER_MATCH_TYPE.DESCRIPTION,
      }
    }
  }
  return {
    isSimilar: false,
    type: BSKY_USER_MATCH_TYPE.NONE,
  }
}
