import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { isSimilarUser } from "~lib/bskyHelpers";
import { getAccountNameAndDisplayName, getUserCells } from "~lib/domHelpers";
import { debugLog, isOneSymbol } from "~lib/utils";
import type { BskyClient } from "./bskyClient";
import type { BskyServiceWorkerClient } from "./bskyServiceWorkerClient";

const notFoundUserCache = new Set<string>();

const bskyUserUrlMap = new Map<string, string>();

export const searchBskyUser = async ({
  client,
  userData,
}: {
  client: BskyServiceWorkerClient;
  userData: ReturnType<typeof getAccountNameAndDisplayName>;
}) => {
  const searchTerms = [
    userData.twAccountNameRemoveUnderscore,
    userData.twDisplayName,
  ];

  for (const term of searchTerms) {
    // one symbol is not a valid search term for bsky
    if (!term || isOneSymbol(term)) {
      continue;
    }
    try {
      const searchResults = await client.searchUser({
        term: term,
        limit: 3,
      });

      for (const searchResult of searchResults) {
        const { isSimilar: isUserFound, type } = isSimilarUser(
          // TODO: simplify
          {
            accountName: userData.twAccountName,
            accountNameRemoveUnderscore: userData.twAccountNameRemoveUnderscore,
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
