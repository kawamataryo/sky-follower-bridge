import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { isSimilarUser } from "~lib/bskyHelpers";
import {
  getAccountNameAndDisplayName,
  getUserCells,
  insertBskyProfileEl,
  insertNotFoundEl,
  insertReloadEl,
} from "~lib/domHelpers";
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

export const searchBskyUsers = async ({
  agent,
  userCellQueryParam,
}: {
  agent: BskyServiceWorkerClient | BskyClient;
  userCellQueryParam: string;
}) => {
  const userCells = getUserCells({
    queryParam: userCellQueryParam,
    filterInsertedElement: true,
  });
  debugLog(`userCells length: ${userCells.length}`);

  let index = 0;

  const targetAccounts = [] as ProfileView[];

  // loop over twitter user profile cells and search and insert bsky user
  for (const userCell of userCells) {
    const { twAccountName, twDisplayName, twAccountNameRemoveUnderscore } =
      getAccountNameAndDisplayName(userCell);

    if (notFoundUserCache.has(twAccountName)) {
      insertNotFoundEl(userCell);
      continue;
    }

    const searchTerms = [twAccountNameRemoveUnderscore, twDisplayName];

    let targetAccount = null;
    let matchType = null;

    // Loop over search parameters and break if a user is found
    searchLoop: for (const term of searchTerms) {
      // one symbol is not a valid search term for bsky
      if (!term || isOneSymbol(term)) {
        continue;
      }
      try {
        const searchResults = await agent.searchUser({
          term: term,
          limit: 3,
        });

        for (const searchResult of searchResults) {
          const { isSimilar: isUserFound, type } = isSimilarUser(
            {
              accountName: twAccountName,
              accountNameRemoveUnderscore: twAccountNameRemoveUnderscore,
              displayName: twDisplayName,
            },
            searchResult,
          );

          if (isUserFound) {
            targetAccount = searchResult;
            matchType = type;
            break searchLoop; // Stop searching when a user is found
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // insert bsky profile or not found element
    if (targetAccount) {
      targetAccounts.push(targetAccount);
    } else {
      notFoundUserCache.add(twAccountName);
    }

    index++;

    // if (process.env.NODE_ENV === "development" && index > 5) {
    //   break
    // }
  }

  return targetAccounts;
};
