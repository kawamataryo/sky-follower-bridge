import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { isSimilarUser } from "~lib/bskyHelpers";
import { debugLog, isOneSymbol, wait } from "~lib/utils";
import type { CrawledUserInfo } from "~types";
import { isImpersonationUser } from "./bskyHelpers";
import type { BskyServiceWorkerClient } from "./bskyServiceWorkerClient";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
const SEARCH_RESULT_LIMIT = 3;
const MAX_CACHE_SIZE = 5000;
const searchResultCache = new Map<string, Promise<ProfileView[]>>();
const profileCache = new Map<string, Promise<ProfileView>>();

const evictOldestIfNeeded = <T>(cache: Map<string, T>, maxSize: number) => {
  if (cache.size > maxSize) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
};

export const clearBskySearchCaches = () => {
  searchResultCache.clear();
  profileCache.clear();
};

const isRateLimitError = (e: unknown): boolean => {
  return e instanceof Error && e.message.toLowerCase().includes("ratelimit");
};

const runWithRetry = async <T>(run: () => Promise<T>) => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await run();
    } catch (e) {
      if (isRateLimitError(e) && attempt < MAX_RETRIES) {
        const backoff = INITIAL_BACKOFF_MS * 2 ** attempt;
        debugLog(
          `Rate limited, retrying in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
        );
        await wait(backoff);
        continue;
      }
      throw e;
    }
  }
};

const getCachedSearchResults = async (
  client: BskyServiceWorkerClient,
  term: string,
  limit: number,
) => {
  const cacheKey = `${term.toLowerCase()}::${limit}`;
  let cachedPromise = searchResultCache.get(cacheKey);

  if (!cachedPromise) {
    cachedPromise = runWithRetry(() =>
      client.searchUser({ term, limit }),
    ).catch((error) => {
      searchResultCache.delete(cacheKey);
      throw error;
    });
    evictOldestIfNeeded(searchResultCache, MAX_CACHE_SIZE);
    searchResultCache.set(cacheKey, cachedPromise);
  }

  return await cachedPromise;
};

const getCachedProfile = async (
  client: BskyServiceWorkerClient,
  actor: string,
) => {
  const cacheKey = actor.toLowerCase();
  let cachedPromise = profileCache.get(cacheKey);

  if (!cachedPromise) {
    cachedPromise = runWithRetry(() => client.getProfile(actor)).catch(
      (error) => {
        profileCache.delete(cacheKey);
        throw error;
      },
    );
    evictOldestIfNeeded(profileCache, MAX_CACHE_SIZE);
    profileCache.set(cacheKey, cachedPromise);
  }

  return await cachedPromise;
};

const normalizeActor = (actor: string) => {
  return actor
    .trim()
    .replace(/^https?:\/\/bsky\.app\/profile\//, "")
    .replace(/^@/, "")
    .replace(/\/$/, "");
};

const canLookupActorDirectly = (actor: string) => {
  return actor.startsWith("did:") || actor.includes(".");
};

const findMatchedProfile = (
  userData: CrawledUserInfo,
  searchResults: ProfileView[],
) => {
  for (const searchResult of searchResults) {
    if (isImpersonationUser(searchResult)) {
      continue;
    }

    const { isSimilar: isUserFound, type } = isSimilarUser(
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

  return null;
};

export const searchBskyUser = async ({
  client,
  userData,
}: {
  client: BskyServiceWorkerClient;
  userData: CrawledUserInfo;
}) => {
  const searchTerms = [userData.accountName, userData.displayName].filter(
    Boolean,
  );
  const uniqueSearchTerms = new Set(searchTerms);
  debugLog("uniqueSearchTerms", uniqueSearchTerms);

  const actorFromDescription = normalizeActor(userData.bskyHandleInDescription);
  if (actorFromDescription && canLookupActorDirectly(actorFromDescription)) {
    try {
      const profile = await getCachedProfile(client, actorFromDescription);
      const directMatch = findMatchedProfile(userData, [profile]);
      if (directMatch) {
        return directMatch;
      }
    } catch (e) {
      console.error(e);
    }
  }

  for (const term of uniqueSearchTerms) {
    if (!term || isOneSymbol(term)) {
      continue;
    }
    try {
      const searchResults = await getCachedSearchResults(
        client,
        term,
        SEARCH_RESULT_LIMIT,
      );
      const matchedProfile = findMatchedProfile(userData, searchResults);

      if (matchedProfile) {
        return matchedProfile;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return null;
};
