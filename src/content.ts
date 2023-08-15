import { BskyClient, BskyLoginParams } from "./lib/bskyClient";
import type { PlasmoCSConfig } from "plasmo"
import { MESSAGE_NAMES } from "~lib/constants";
import "./style.content.css"
import { initialize, searchBskyUsers } from '~lib/searchAndInsertBskyUsers';

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*", "https://x.com/*"],
  all_frames: true
}

const searchAndShowBskyUsers = async ({
  identifier,
  password,
}: BskyLoginParams) => {

  const agent = await BskyClient.createAgent({
    identifier,
    password
  })
  // TODO: follow と unfollow のactionとblockのactionを分ける
  // ただ、blockのAPIが見つからない...
  // これが近い
  // https://github.com/bluesky-social/social-app/blob/003a75fd8e3fbee4676794d89c3573331e51bb81/src/state/models/content/profile.ts#L195-L220
  await searchBskyUsers({
    agent,
    btnLabel: "follow",
    statusKey: "following",
    userCellQueryParam: '[data-testid="primaryColumn"] [data-testid="UserCell"]',
    addQuery: async (arg: string) => await agent.follow(arg),
    removeQuery: async (arg: string) => await agent.unfollow(arg),
   })
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  console.log("🚀 ~ file: content.ts:37 ~ chrome.runtime.onMessage.addListener ~ message.name:", message.name)

  if (Object.values(MESSAGE_NAMES).includes(message.name)) {
    initialize()
      searchAndShowBskyUsers({
        identifier: message.body.userId,
        password: message.body.password,
      })
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
