import { BskyClient } from "./lib/bskyClient";
import type { PlasmoCSConfig } from "plasmo"
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { MESSAGE_NAMES } from "~lib/constants";
import { cleanBskyUserElements, getAccountNameAndDisplayName, getUserCells, insertBskyProfileEl, insertNotFoundEl, isOutOfView } from "~lib/domHelpers";
import { isSimilarUser } from "~lib/bskyHelpers";

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*"],
  all_frames: true
}

let abortController = new AbortController();

const initialize = async () => {
  abortController.abort()
  abortController = new AbortController()
}


const searchBskyUsers = async ({
  userId,
  password
}) => {
  initialize()

  const agent = await BskyClient.createAgent({
    identifier: userId,
    password: password,
  });

  const userCells = getUserCells()

  for(const [index, userCell] of userCells.entries()) {
    if(isOutOfView(userCell)) { continue }

    const { twAccountName, twDisplayName } = getAccountNameAndDisplayName(userCell)

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
      }
    }

    if(process.env.NODE_ENV === "development" && index > 3) {
      break
    }
  }
}


chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if(message.name === MESSAGE_NAMES.SEARCH_BSKY_USER) {
      searchBskyUsers({
        userId: message.body.userId,
        password: message.body.password
      }).then(() => {
        sendResponse({ error: false })
      }).catch((e) => {
        sendResponse({ error: true, message: e})
      })
      return true
   }
   return false
})
