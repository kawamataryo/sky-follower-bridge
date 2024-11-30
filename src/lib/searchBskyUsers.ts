import { isSimilarUser } from "~lib/bskyHelpers";
import { isOneSymbol } from "~lib/utils";
import type { CrawledUserInfo } from "~types";
import type { BskyServiceWorkerClient } from "./bskyServiceWorkerClient";
import { isImpersonationUser } from "./bskyHelpers";

export const searchBskyUser = async ({
  client,
  userData,
}: {
  client: BskyServiceWorkerClient;
  userData: CrawledUserInfo;
}) => {
  const searchTerms = [
    ...(userData.bskyHandle ? [userData.bskyHandle] : []),
    userData.accountNameRemoveUnderscore,
    userData.accountNameReplaceUnderscore,
    userData.displayName,
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
