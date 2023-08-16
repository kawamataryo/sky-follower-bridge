import { isOutOfTopViewport } from './domHelpers';
import { getAccountNameAndDisplayName, getUserCells, insertBskyProfileEl, insertNotFoundEl, insertReloadEl } from "~lib/domHelpers";
import { isSimilarUser } from "~lib/bskyHelpers";
import { debugLog } from "~lib/utils";
import type { BskyClient } from './bskyClient';
import type { ViewerState } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import type { UserCellBtnLabel } from './components/BskyUserCell';


const notFoundUserCache = new Set<string>()

const followerUrlMap = new Map<string, string>()

export const searchBskyUsers = async (
  {
    agent,
    btnLabel,
    userCellQueryParam,
    statusKey,
    addQuery,
    removeQuery,
  }: {
    agent: BskyClient,
    userCellQueryParam: string,
    btnLabel: UserCellBtnLabel,
    statusKey: keyof ViewerState,
    addQuery: (arg: string) => Promise<any>,
    removeQuery: (arg: string) => Promise<any>,
  }) => {

  const userCells = getUserCells({
    queryParam: userCellQueryParam,
    filterInsertedElement: true,
  })
  debugLog(`userCells length: ${userCells.length}`)

  let index = 0
  for (const userCell of userCells) {
    if (isOutOfTopViewport(userCell)) {
      continue
    }
    const { twAccountName, twDisplayName } = getAccountNameAndDisplayName(userCell)
    if (notFoundUserCache.has(twAccountName)) {
      insertNotFoundEl(userCell)
      continue
    }

    const [searchResultByAccountName] = await agent.searchUser({
      term: twAccountName,
      limit: 1,
    })

    // TODO: Refactor, this is duplicated
    // first, search by account name
    if (isSimilarUser(twDisplayName, searchResultByAccountName) || isSimilarUser(twAccountName, searchResultByAccountName)) {
      insertBskyProfileEl({
        dom: userCell,
        profile: searchResultByAccountName,
        statusKey,
        btnLabel,
        addAction: async () => {
          const result = await addQuery(searchResultByAccountName.did);
          followerUrlMap.set(searchResultByAccountName.did, result.uri)
        },
        removeAction: async () => {
          if (searchResultByAccountName?.viewer?.following) {
            await removeQuery(searchResultByAccountName?.viewer?.following);
          } else {
            await removeQuery(followerUrlMap.get(searchResultByAccountName.did));
          }
        },
      })
    } else {
      // if not found, search by display name
      const [searchResultByDisplayName] = await agent.searchUser({
        term: twDisplayName,
        limit: 1,
      })
      if (isSimilarUser(twDisplayName, searchResultByDisplayName) || isSimilarUser(twAccountName, searchResultByDisplayName)) {
        insertBskyProfileEl({
          dom: userCell,
          profile: searchResultByDisplayName,
          statusKey,
          btnLabel,
          addAction: async () => {
            const result = await addQuery(searchResultByDisplayName.did);
            followerUrlMap.set(searchResultByDisplayName.did, result.uri)
          },
          removeAction: async () => {
            if (searchResultByDisplayName?.viewer?.following) {
              await removeQuery(searchResultByDisplayName?.viewer?.following);
            } else {
              await removeQuery(followerUrlMap.get(searchResultByDisplayName.did));
            }
          },
        })
      } else {
        insertNotFoundEl(userCell)
        notFoundUserCache.add(twAccountName)
      }
    }

    index++
    if (process.env.NODE_ENV === "development" && index > 5) {
      break
    }
  }

  // TODO: if there are more users, insert reload button
  insertReloadEl(async () => {
    await searchBskyUsers({
      agent,
      btnLabel,
      userCellQueryParam,
      statusKey,
      addQuery,
      removeQuery,
    })
  })
}
