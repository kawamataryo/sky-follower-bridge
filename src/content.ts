import { BskyClient } from "./lib/bskyClient";
import type { PlasmoCSConfig } from "plasmo"
import { MESSAGE_NAMES } from "~lib/constants";
import "./style.content.css"
import { initialize, searchBskyUsers } from '~lib/searchAndInsertBskyUsers';

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*", "https://x.com/*"],
  all_frames: true
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.name === MESSAGE_NAMES.SEARCH_BSKY_USER) {
    initialize()
    //TODO 共通化したいので、searchBskyUsersをwrapする関数が欲しい。それが、blockとfollowを切り替える関数
    BskyClient.createAgent({
      identifier: message.body.userId,
      password: message.body.password,
    })
    .then((agent) => searchBskyUsers({agent}))
    .then(() => {
      sendResponse({ hasError: false })
    })
    .catch((e) => {
      sendResponse({ hasError: true, message: e.toString() })
    });
    return true
  }
  return false
})
