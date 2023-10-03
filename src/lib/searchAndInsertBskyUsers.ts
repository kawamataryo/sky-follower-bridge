import { isOutOfTopViewport, removeReloadEl } from './domHelpers';
import { getAccountNameAndDisplayName, getUserCells, insertBskyProfileEl, insertNotFoundEl, insertReloadEl } from "~lib/domHelpers";
import { isSimilarUser } from "~lib/bskyHelpers";
import { debugLog, isOneSymbol } from "~lib/utils";
import type { BskyClient } from './bskyClient';
import type { ViewerState } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import type { UserCellBtnLabel } from './components/BskyUserCell';
import type { BskyServiceWorkerClient } from './bskyServiceWorkerClient';


const notFoundUserCache = new Set<string>()

const bskyUserUrlMap = new Map<string, string>()

export const searchAndInsertBskyUsers = async (
  {
    agent,
    btnLabel,
    userCellQueryParam,
    statusKey,
    addQuery,
    removeQuery,
  }: {
    agent: BskyServiceWorkerClient | BskyClient,
    userCellQueryParam: string,
    btnLabel: UserCellBtnLabel,
    statusKey: keyof ViewerState,
    addQuery: (arg: string) => Promise<any>,
    removeQuery: (arg: string) => Promise<any>,
  }) => {

  removeReloadEl()

  const userCells = getUserCells({
    queryParam: userCellQueryParam,
    filterInsertedElement: true,
  })
  debugLog(`userCells length: ${userCells.length}`)

  let index = 0

  // loop over twitter user profile cells and search and insert bsky user
  for (const userCell of userCells) {
    if (isOutOfTopViewport(userCell)) {
      continue
    }

    const { twAccountName, twDisplayName, twAccountNameRemoveUnderscore } = getAccountNameAndDisplayName(userCell)

    if (notFoundUserCache.has(twAccountName)) {
      insertNotFoundEl(userCell)
      continue
    }

    const searchTerms = [
      twAccountNameRemoveUnderscore,
      twDisplayName,
    ]

    let targetAccount = null
    let matchType = null

    // Loop over search parameters and break if a user is found
    for (const term of searchTerms) {
      // one symbol is not a valid search term for bsky
      if (!term || isOneSymbol(term)) {
        continue
      }
      try {
        const [searchResult] = await agent.searchUser({
          term: term,
          limit: 1,
        })

        const { isSimilar: isUserFound, type } = isSimilarUser({
          accountName: twAccountName,
          accountNameRemoveUnderscore: twAccountNameRemoveUnderscore,
          displayName: twDisplayName,
        }, searchResult)

        if (isUserFound) {
          targetAccount = searchResult
          matchType = type
          break; // Stop searching when a user is found
        }
      } catch (e) {
        console.error(e)
      }
    }

    // insert bsky profile or not found element
    if (targetAccount) {
      insertBskyProfileEl({
        dom: userCell,
        profile: targetAccount,
        statusKey,
        btnLabel,
        matchType,
        addAction: async () => {
          const result = await addQuery(targetAccount.did);
          bskyUserUrlMap.set(targetAccount.did, result.uri)
        },
        removeAction: async () => {
          if (targetAccount?.viewer?.following) {
            await removeQuery(targetAccount?.viewer?.following);
          } else {
            await removeQuery(bskyUserUrlMap.get(targetAccount.did));
          }
        },
      })
    } else {
      insertNotFoundEl(userCell)
      notFoundUserCache.add(twAccountName)
    }

    index++

    if (process.env.NODE_ENV === "development" && index > 5) {
      break
    }
  }

  // TODO: if there are more users, insert reload button
  insertReloadEl(async () => {
    await searchAndInsertBskyUsers({
      agent,
      btnLabel,
      userCellQueryParam,
      statusKey,
      addQuery,
      removeQuery,
    })
  })
}
