import { BskyClient } from "./lib/bskyClient";
import type { PlasmoCSConfig } from "plasmo"
import { MESSAGE_NAMES } from "~lib/constants";
import { getAccountNameAndDisplayName, getUserCells, insertBskyProfileEl, insertNotFoundEl, insertReloadEl, removeReloadElIfExists } from "~lib/domHelpers";
import { isSimilarUser } from "~lib/bskyHelpers";
import "./style.content.css"
import { debugLog } from "~lib/utils";

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*"],
  all_frames: true
}

let abortController = new AbortController();

const notFoundUserCache = new Set<string>()

const followerUrlMap = new Map<string, string>()

const initialize = async () => {
  abortController.abort()
  abortController = new AbortController()
}


const searchBskyUsers = async ({
  userId,
  password
}) => {
  removeReloadElIfExists()

  const agent = await BskyClient.createAgent({
    identifier: userId,
    password: password,
  });

  const userCells = getUserCells()
  debugLog(`userCells length: ${userCells.length}`)

  for (const [index, userCell] of userCells.entries()) {
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
        abortController,
          followAction: async () => {
            const result = await agent.follow(searchResultByAccountName.did);
            followerUrlMap.set(searchResultByAccountName.did, result.uri)
          },
          unfollowAction: async () => {
            if(searchResultByAccountName?.viewer?.following) {
              await agent.unfollow(searchResultByAccountName?.viewer?.following);
            } else {
              await agent.unfollow(followerUrlMap.get(searchResultByAccountName.did));
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
          abortController,
          followAction: async () => {
            const result = await agent.follow(searchResultByDisplayName.did);
            followerUrlMap.set(searchResultByDisplayName.did, result.uri)
          },
          unfollowAction: async () => {
            if(searchResultByDisplayName?.viewer?.following) {
              await agent.unfollow(searchResultByDisplayName?.viewer?.following);
            } else {
              await agent.unfollow(followerUrlMap.get(searchResultByDisplayName.did));
            }
          },
        })
      } else {
        insertNotFoundEl(userCell)
        notFoundUserCache.add(twAccountName)
      }
    }
    if (process.env.NODE_ENV === "development" && index > 5) {
      break
    }
  }

  // TODO: if there are more users, insert reload button
  insertReloadEl(async () => {
    await searchBskyUsers({
      userId,
      password,
    })
  })
}


chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.name === MESSAGE_NAMES.SEARCH_BSKY_USER) {
    initialize()

    searchBskyUsers({
      userId: message.body.userId,
      password: message.body.password
    }).then(() => {
      sendResponse({ hasError: false })
    }).catch((e) => {
      sendResponse({ hasError: true, message: e.toString() })
    })
    return true
  }
  return false
})
