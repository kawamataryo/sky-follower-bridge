import { FormEvent, useState } from "react"

import "./style.css"

import { sendToContentScript } from "@plasmohq/messaging"

import { MESSAGE_NAMES, STORAGE_KEYS, TARGET_URLS, TARGET_URLS_REGEX } from "~lib/constants"
import { useStorage } from "@plasmohq/storage/hook"

function IndexPopup() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useStorage(STORAGE_KEYS.BSKY_PASSWORD, "")
  const [userId, setUserId] = useStorage(STORAGE_KEYS.BSKY_USER_ID, "")
  const [errorMessage, setErrorMessage] = useState("")

  const isDisabled = !password || !userId || isLoading

  const isExecutablePage = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return TARGET_URLS_REGEX.some((r) => r.test(tab.url))
  }

  const searchBskyUser = async (e: FormEvent) => {
    e.preventDefault()

    if(!await isExecutablePage()) {
      setErrorMessage("Is not executable page. Please open the Twitter followers or following page. twitter.com/*/followers or twitter.com/*/following.")
      return;
    }

    setErrorMessage("")
    setIsLoading(true)
    try {
      const res = await sendToContentScript({
        name: MESSAGE_NAMES.SEARCH_BSKY_USER,
        body: {
          password,
          userId,
        }
      })
      if(res.error) {
        setErrorMessage(res.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-5 w-[350px]">
      <h1 className="text-primary text-2xl font-thin">Sky Follower Bridge</h1>
      <form onSubmit={searchBskyUser}>
        <label className="input-group input-group-lg mt-4">
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
            placeholder="bluesky account id"
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
            placeholder="bluesky app password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className=" input input-bordered input-sm w-full max-w-xs"
          />
        </label>
        <button
          type="submit"
          className={`disabled:text-gray-600 mt-3 normal-case btn btn-primary btn-sm w-full ${isLoading ? "loading" : ""}`}
          disabled={isDisabled}>
          Find Bluesky Users
        </button>
        {errorMessage && (
          <div className="mt-1 text-error font-bold">Error: {errorMessage}</div>
        )}
      </form>
    </div>
  )
}

export default IndexPopup
