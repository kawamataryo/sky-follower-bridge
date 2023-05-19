import { BskyClient } from "./lib/bskyClient";
import type { PlasmoCSConfig } from "plasmo"
import { MESSAGE_NAMES } from "~lib/constants";
import { getAccountNameAndDisplayName, getUserCells, insertBskyProfileEl, insertNotFoundEl, insertReloadEl, isOutOfView } from "~lib/domHelpers";
import { isSimilarUser } from "~lib/bskyHelpers";
import "./style.content.css"
import { debugLog } from "~lib/utils";

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*"],
  all_frames: true
}

let abortController = new AbortController();

const notFoundUserCache = new Set<string>()

const initialize = async () => {
  abortController.abort()
  abortController = new AbortController()
}


const searchBskyUsers = async ({
  userId,
  password
}) => {
  const agent = await BskyClient.createAgent({
    identifier: userId,
    password: password,
  });

  const userCells = getUserCells()
  debugLog(`userCells length: ${userCells.length}`)

  for(const [index, userCell] of userCells.entries()) {
    const { twAccountName, twDisplayName } = getAccountNameAndDisplayName(userCell)
    if(notFoundUserCache.has(twAccountName)) {
      insertNotFoundEl(userCell)
      continue
     }

    const [searchResultByAccountName] = await agent.searchUser({
      term: twAccountName,
      limit: 1,
    })

    // first, search by account name
    if(isSimilarUser(twDisplayName, searchResultByAccountName) || isSimilarUser(twAccountName, searchResultByAccountName)) {
      insertBskyProfileEl({
        dom: userCell,
        profile: searchResultByAccountName,
        abortController,
        clickAction: async () => { await agent.follow(searchResultByAccountName.did) }
      })
    } else {
      // if not found, search by display name
      const [searchResultByDisplayName] = await agent.searchUser({
        term: twDisplayName,
        limit: 1,
      })
      if(isSimilarUser(twDisplayName, searchResultByDisplayName) || isSimilarUser(twAccountName, searchResultByDisplayName)) {
        insertBskyProfileEl({
          dom: userCell,
          profile: searchResultByDisplayName,
          abortController,
          clickAction: async () => { await agent.follow(searchResultByAccountName.did) }
        })
      } else {
        insertNotFoundEl(userCell)
        notFoundUserCache.add(twAccountName)
      }
    }

    if(process.env.NODE_ENV === "development" && index > 3) {
      break
    }
  }
}


chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if(message.name === MESSAGE_NAMES.SEARCH_BSKY_USER) {
      initialize()

      searchBskyUsers({
        userId: message.body.userId,
        password: message.body.password
      }).then(() => {
        insertReloadEl(async () => {
          await searchBskyUsers({
            userId: message.body.userId,
            password: message.body.password
          })
        })
        sendResponse({ hasError: false })
      }).catch((e) => {
        sendResponse({ hasError: true, message: e.toString()})
      })
      return true
   }
   return false
})
