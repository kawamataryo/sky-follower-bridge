import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

export const isSimilarUser = (terms: string[], bskyProfile: ProfileView | undefined) => {
  if(!bskyProfile) { return false }

  return terms.some(term => {
    const lowerCaseName = term.toLocaleLowerCase()
    if(lowerCaseName === bskyProfile?.handle.toLocaleLowerCase().replace("@", "").split('.')[0]) {
      return true
    }
  if(lowerCaseName === bskyProfile.displayName?.toLocaleLowerCase()) {
      return true
    }
    if(bskyProfile.description?.toLocaleLowerCase().includes(lowerCaseName)) {
      return true
    }
    return false
  })
}
