import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { isOneSymbol } from "~lib/utils";
import { isImpersonationUser } from "./bskyHelpers";
import type { BskyServiceWorkerClient } from "./bskyServiceWorkerClient";

export const reSearchBskyUser = async ({
  client,
  userData,
}: {
  client: BskyServiceWorkerClient;
  userData: {
    accountName: string;
    displayName: string;
  };
}): Promise<ProfileView[]> => {
  const searchTerms = [
    userData.accountName,
    userData.displayName,
    userData.accountName.replaceAll("_", ""),
    userData.displayName.replaceAll("_", ""),
  ];
  const uniqueSearchTerms = new Set(searchTerms);

  const searchResultDidSet = new Set<string>();
  const searchResults: ProfileView[] = [];

  for (const term of uniqueSearchTerms) {
    // one symbol is not a valid search term for bsky
    if (!term || isOneSymbol(term)) {
      continue;
    }
    try {
      const results = await client.searchUser({
        term,
        limit: 3,
      });

      for (const result of results) {
        // skip impersonation users
        if (isImpersonationUser(result)) {
          continue;
        }
        if (searchResultDidSet.has(result.did)) {
          continue;
        }
        searchResultDidSet.add(result.did);
        searchResults.push(result);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return searchResults;
};
