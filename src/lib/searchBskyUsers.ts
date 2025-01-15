import { isSimilarUser } from "~lib/bskyHelpers";
import { debugLog, isOneSymbol } from "~lib/utils";
import type { CrawledUserInfo } from "~types";
import { isImpersonationUser } from "./bskyHelpers";
import type { BskyServiceWorkerClient } from "./bskyServiceWorkerClient";

export const searchBskyUser = async ({
  client,
  userData,
}: {
  client: BskyServiceWorkerClient;
  userData: CrawledUserInfo;
}) => {
  const searchTerms = [
    ...(userData.bskyHandleInDescription
      ? [userData.bskyHandleInDescription]
      : []),
    userData.accountNameRemoveUnderscore,
    userData.accountNameReplaceUnderscore,
    userData.displayName,
  ];
  const uniqueSearchTerms = new Set(searchTerms);
  debugLog("uniqueSearchTerms", uniqueSearchTerms);

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
            bskyHandleInDescription: userData.bskyHandleInDescription,
            accountName: userData.accountName,
            accountNameRemoveUnderscore: userData.accountNameRemoveUnderscore,
            accountNameReplaceUnderscore: userData.accountNameReplaceUnderscore,
            displayName: userData.displayName,
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
