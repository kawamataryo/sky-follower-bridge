import { type FormEvent, useState } from "react"
import { P, match } from "ts-pattern"

import "./style.css"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

import {
  MAX_RELOAD_COUNT,
  MESSAGE_NAMES,
  MESSAGE_TYPE,
  STORAGE_KEYS,
  TARGET_URLS_REGEX
} from "~lib/constants"

import { debugLog } from "./lib/utils"
import { ReloadButton } from "~lib/components/ReloadBtn"

function IndexPopup() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useStorage(STORAGE_KEYS.BSKY_PASSWORD, "")
  const [userId, setUserId] = useStorage(STORAGE_KEYS.BSKY_USER_ID, "")
  const [reloadCount, setReloadCount] = useState(0)
  const [message, setMessage] = useState<null | {
    type: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE]
    message: string
  }>(null)
  const isDisabled = !password || !userId || isLoading
  const isShowErrorMessage = message?.type === MESSAGE_TYPE.ERROR
  const isShowSuccessMessage = message?.type === MESSAGE_TYPE.SUCCESS

  const setErrorMessage = (message: string) => {
    setMessage({ type: MESSAGE_TYPE.ERROR, message })
  }

  const reloadActiveTab = async () => {
    const [{ id: tabId }] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })
    await chrome.tabs.reload(tabId)
  }

  const searchBskyUser = async (e?: FormEvent) => {
    if(e) {
      e.preventDefault()
    }

    const [{ url: currentUrl }] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    if (!Object.values(TARGET_URLS_REGEX).some((r) => r.test(currentUrl))) {
      setErrorMessage(
        "Error: Invalid page. please open the Twitter following or blocking page."
      )
      return
    }

    const messageName = match(currentUrl)
      .with(
        P.when((url) => TARGET_URLS_REGEX.FOLLOW.test(url)),
        () => MESSAGE_NAMES.SEARCH_BSKY_USER_ON_FOLLOW_PAGE
      )
      .with(
        P.when((url) => TARGET_URLS_REGEX.BLOCK.test(url)),
        () => MESSAGE_NAMES.SEARCH_BSKY_USER_ON_BLOCK_PAGE
      )
      .with(
        P.when((url) => TARGET_URLS_REGEX.LIST.test(url)),
        () => MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE
      )
      .run()

    setMessage(null)
    setIsLoading(true)

    try {
      const res: { hasError: boolean; message: string } =
        await sendToContentScript({
          name: messageName,
          body: {
            password,
            userId
          }
        })
      if (res.hasError) {
        setErrorMessage(res.message)
      } else {
        setMessage({
          type: MESSAGE_TYPE.SUCCESS,
          message: "Completed. Try again if no results found.”"
        })
      }
    } catch (e) {
      if(e.message && e.message.includes("Could not establish connection") && reloadCount < MAX_RELOAD_COUNT) {
        setReloadCount((prev) => prev + 1)
        await reloadActiveTab()
        await new Promise(r => setTimeout(r, 3000))
        await searchBskyUser()
      } else {
        setErrorMessage(
          "Error: Something went wrong. Please reload the web page and try again."
        )
        console.error(e)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-5 pt-3 pb-4 w-[380px]">
      <h1 className="text-primary text-2xl font-thin flex gap-2 items-center">
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 48 48">
          <g
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="4">
            <path
              strokeLinecap="round"
              d="M36 8H13c-3 0-9 2-9 8s6 8 9 8h22c3 0 9 2 9 8s-6 8-9 8H12"
            />
            <path d="M40 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM8 44a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z" />
          </g>
        </svg>
        Sky Follower Bridge
      </h1>
      <form onSubmit={searchBskyUser} className="mt-2">
        <label className="input-group input-group-lg">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Bluesky handle or login email"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="input input-bordered input-sm w-full max-w-xs"
          />
        </label>
        <label className="input-group input-group-lg mt-2">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
              />
            </svg>
          </span>
          <input
            type="password"
            placeholder="Bluesky app password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered input-sm w-full max-w-xs"
          />
        </label>
        <button
          type="submit"
          className={`disabled:text-gray-600 mt-3 normal-case btn btn-primary btn-sm w-full`}
          disabled={isDisabled}>
          { isLoading && <span className="w-4 loading loading-spinner"></span> }
          { isLoading ? "Finding Bluesky Users" : "Find Bluesky Users" }
        </button>
        {isShowErrorMessage && (
          <div className="flex gap-2 items-center text-red-600 border border-red-600 p-2 rounded-md mt-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                stroke-linejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{message.message}</span>
          </div>
        )}
        {isShowSuccessMessage && (
          <div className="flex gap-2 items-center text-green-600 border border-green-600 p-1 rounded-md mt-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Success. Try again if no results found.</span>
          </div>
        )}
      </form>
    </div>
  )
}

export default IndexPopup
