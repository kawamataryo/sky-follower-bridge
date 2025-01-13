import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { debugLog, isOneSymbol } from "~lib/utils";
import type { CrawledUserInfo } from "~types";
import { isImpersonationUser } from "./bskyHelpers";
import type { BskyServiceWorkerClient } from "./bskyServiceWorkerClient";

export async function fuzzySearchBskyUser({
  client,
  userData,
}: {
  client: BskyServiceWorkerClient;
  userData: Omit<CrawledUserInfo, "originalAvatar" | "originalProfileLink">;
}) {
  const searchTerms = [
    userData.bskyHandleInDescription,
    userData.accountNameRemoveUnderscore,
    userData.accountNameReplaceUnderscore,
    userData.displayName,
  ].filter(
    (term) =>
      // one symbol is not a valid search term for bsky
      term && !isOneSymbol(term),
  );

  debugLog("searchTerms: ", searchTerms);

  const detectedUsers: {
    [key: string]: ProfileView;
  } = {};

  const uniqueSearchTerms = new Set(searchTerms);
  debugLog("uniqueSearchTerms: ", uniqueSearchTerms);
  for (const term of uniqueSearchTerms) {
    try {
      const searchResults = await client.searchUser({
        term,
        limit: 3,
      });

      debugLog("searchResults: ", searchResults);
      for (const searchResult of searchResults) {
        // skip impersonation users
        if (isImpersonationUser(searchResult)) {
          continue;
        }

        detectedUsers[searchResult.did] = searchResult;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return Object.values(detectedUsers);
}
