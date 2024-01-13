import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { BSKY_USER_MATCH_TYPE } from "./constants";

type Names = {
  accountName: string;
  accountNameRemoveUnderscore: string;
  displayName: string;
};

export const isSimilarUser = (
  names: Names,
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

  const lowerCaseNames = Object.entries(names).reduce<Names>(
    (acc, [key, value]) => {
      acc[key] = value.toLowerCase();
      return acc;
    },
    {} as Names,
  );

  const bskyHandle = bskyProfile.handle
    .toLocaleLowerCase()
    .replace("@", "")
    .split(".")[0];

  if (
    lowerCaseNames.accountName === bskyHandle ||
    lowerCaseNames.accountNameRemoveUnderscore === bskyHandle
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

  if (
    bskyProfile.description
      ?.toLocaleLowerCase()
      .includes(`@${lowerCaseNames.accountName}`) &&
    !["pfp ", "pfp: ", "pfp by "].some((t) =>
      bskyProfile.description
        .toLocaleLowerCase()
        .includes(`${t}@${lowerCaseNames.accountName}`),
    )
  ) {
    return {
      isSimilar: true,
      type: BSKY_USER_MATCH_TYPE.DESCRIPTION,
    };
  }

  return {
    isSimilar: false,
    type: BSKY_USER_MATCH_TYPE.NONE,
  };
};
