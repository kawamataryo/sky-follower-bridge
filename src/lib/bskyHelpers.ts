import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { BSKY_PROFILE_LABEL, BSKY_USER_MATCH_TYPE } from "./constants";

type xUserInfo = {
  bskyHandleInDescription: string;
  accountName: string;
  accountNameRemoveUnderscore: string;
  accountNameReplaceUnderscore: string;
  displayName: string;
};

export const isSimilarUser = (
  xUserInfo: xUserInfo,
  bskyProfile: ProfileView | undefined,
): {
  isSimilar: boolean;
  type: (typeof BSKY_USER_MATCH_TYPE)[keyof typeof BSKY_USER_MATCH_TYPE];
} => {
  if (!bskyProfile) {
    return {
      isSimilar: false,
      type: BSKY_USER_MATCH_TYPE.NONE,
    };
  }

  // this is to handle the case where the user has a bsky handle in their description
  if (xUserInfo.bskyHandleInDescription) {
    const formattedBskyHandle = bskyProfile.handle.replace("@", "");
    const formattedBskyHandleInDescription =
      xUserInfo.bskyHandleInDescription.replace("@", "");
    if (
      formattedBskyHandle === formattedBskyHandleInDescription ||
      formattedBskyHandle.includes(formattedBskyHandleInDescription)
    ) {
      return {
        isSimilar: true,
        type: BSKY_USER_MATCH_TYPE.DESCRIPTION,
      };
    }
  }

  const lowerCaseNames = Object.entries(xUserInfo).reduce<xUserInfo>(
    (acc, [key, value]) => {
      if (!value) {
        return acc;
      }
      acc[key] = value.toLowerCase();
      return acc;
    },
    {} as xUserInfo,
  );

  const bskyHandle = bskyProfile.handle
    .toLocaleLowerCase()
    .replace("@", "")
    .split(".")[0];

  if (
    lowerCaseNames.accountName === bskyHandle ||
    lowerCaseNames.accountNameRemoveUnderscore === bskyHandle ||
    lowerCaseNames.accountNameReplaceUnderscore === bskyHandle
  ) {
    return {
      isSimilar: true,
      type: BSKY_USER_MATCH_TYPE.HANDLE,
    };
  }

  if (
    lowerCaseNames.displayName === bskyProfile.displayName?.toLocaleLowerCase()
  ) {
    return {
      isSimilar: true,
      type: BSKY_USER_MATCH_TYPE.DISPLAY_NAME,
    };
  }

  return {
    isSimilar: false,
    type: BSKY_USER_MATCH_TYPE.NONE,
  };
};

export const isImpersonationUser = (user: ProfileView) => {
  return user.labels.some(
    (label) => label.val === BSKY_PROFILE_LABEL.IMPERSONATION,
  );
};
