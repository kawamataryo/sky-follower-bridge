import { isSimilarUser } from "~lib/bskyHelpers";
import type { getAccountNameAndDisplayName } from "~lib/domHelpers";
import { isOneSymbol } from "~lib/utils";
import type { BskyServiceWorkerClient } from "./bskyServiceWorkerClient";
import { BSKY_PROFILE_LABEL } from "./constants";
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";

const isImpersonationUser = (user: ProfileView) => {
  return user.labels.some((label) => label.val === BSKY_PROFILE_LABEL.IMPERSONATION);
}

export const searchBskyUser = async ({
  client,
  userData,
}: {
  client: BskyServiceWorkerClient;
  userData: ReturnType<typeof getAccountNameAndDisplayName>;
}) => {
  const searchTerms = [
    ...(userData.bskyHandle ? [userData.bskyHandle] : []),
    userData.twAccountNameRemoveUnderscore,
    userData.twAccountNameReplaceUnderscore,
    userData.twDisplayName,
  ];
  const uniqueSearchTerms = new Set(searchTerms);

  for (const term of uniqueSearchTerms) {
    // one symbol is not a valid search term for bsky
    if (!term || isOneSymbol(term)) {
      continue;
    }
    try {
      const searchResults = await client.searchUser({
        term,
        limit: 3,
      });

      for (const searchResult of searchResults) {

        // skip impersonation users
        if (isImpersonationUser(searchResult)) {
          continue;
        }

        const { isSimilar: isUserFound, type } = isSimilarUser(
          // TODO: simplify
          {
            bskyHandleInDescription: userData.bskyHandle,
            accountName: userData.twAccountName,
            accountNameRemoveUnderscore: userData.twAccountNameRemoveUnderscore,
            accountNameReplaceUnderscore:
              userData.twAccountNameReplaceUnderscore,
            displayName: userData.twDisplayName,
          },
          searchResult,
        );

        if (isUserFound) {
          return {
            bskyProfile: searchResult,
            matchType: type,
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return null;
};
