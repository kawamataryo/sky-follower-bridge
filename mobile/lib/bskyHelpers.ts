import type { AppBskyActorDefs } from "@atproto/api";
import distance from "jaro-winkler";
import type { CrawledUserInfo, MatchType } from "~/types";
import { BSKY_PROFILE_LABEL, BSKY_USER_MATCH_TYPE } from "./constants";

type ProfileView = AppBskyActorDefs.ProfileView;

export const isSimilarUser = (
  crawledUser: CrawledUserInfo,
  bskyProfile: ProfileView | undefined,
): { isSimilar: boolean; type: MatchType } => {
  if (!bskyProfile) {
    return { isSimilar: false, type: BSKY_USER_MATCH_TYPE.NONE };
  }

  if (crawledUser.bskyHandleInDescription) {
    const bskyHandle = bskyProfile.handle.replace("@", "");
    const descHandle = crawledUser.bskyHandleInDescription.replace("@", "");
    if (bskyHandle === descHandle || bskyHandle.includes(descHandle)) {
      return { isSimilar: true, type: BSKY_USER_MATCH_TYPE.DESCRIPTION };
    }
  }

  const lower = {
    accountName: crawledUser.accountName.toLowerCase(),
    accountNameRemoveUnderscore:
      crawledUser.accountNameRemoveUnderscore.toLowerCase(),
    accountNameReplaceUnderscore:
      crawledUser.accountNameReplaceUnderscore.toLowerCase(),
    displayName: crawledUser.displayName.toLowerCase(),
  };

  const bskyHandle = bskyProfile.handle
    .toLowerCase()
    .replace("@", "")
    .split(".")[0];

  if (
    lower.accountName === bskyHandle ||
    lower.accountNameRemoveUnderscore === bskyHandle ||
    lower.accountNameReplaceUnderscore === bskyHandle ||
    distance(lower.accountName, bskyHandle) > 0.92
  ) {
    return { isSimilar: true, type: BSKY_USER_MATCH_TYPE.HANDLE };
  }

  if (lower.displayName === bskyProfile.displayName?.toLowerCase()) {
    return { isSimilar: true, type: BSKY_USER_MATCH_TYPE.DISPLAY_NAME };
  }

  return { isSimilar: false, type: BSKY_USER_MATCH_TYPE.NONE };
};

export const isImpersonationUser = (user: ProfileView): boolean => {
  return (
    user.labels?.some(
      (label) => label.val === BSKY_PROFILE_LABEL.IMPERSONATION,
    ) ?? false
  );
};
