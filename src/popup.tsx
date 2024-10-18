import { type FormEvent, useCallback, useEffect, useState } from "react";
import { P, match } from "ts-pattern";

import "./style.css";

import { sendToContentScript } from "@plasmohq/messaging";

import {
  AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE,
  MAX_RELOAD_COUNT,
  MESSAGE_NAMES,
  MESSAGE_TYPE,
  STORAGE_KEYS,
  TARGET_URLS_REGEX,
} from "~lib/constants";

function IndexPopup() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [reloadCount, setReloadCount] = useState(0);
  const [authFactorToken, setAuthFactorToken] = useState("");
  const [isShowAuthFactorTokenInput, setIsShowAuthFactorTokenInput] =
    useState(false);
  const [message, setMessage] = useState<null | {
    type: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
    message: string;
  }>(null);
  const isDisabled = !password || !identifier || isLoading;
  const isShowErrorMessage = message?.type === MESSAGE_TYPE.ERROR;
  const isShowSuccessMessage = message?.type === MESSAGE_TYPE.SUCCESS;

  const setErrorMessage = (message: string) => {
    setMessage({ type: MESSAGE_TYPE.ERROR, message });
  };

  const reloadActiveTab = async () => {
    const [{ id: tabId }] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    await chrome.tabs.reload(tabId);
  };

  const saveCredentialsToStorage = () => {
    chrome.storage.local.set({
      [STORAGE_KEYS.BSKY_PASSWORD]: password,
      [STORAGE_KEYS.BSKY_USER_ID]: identifier,
    });
  };

  const loadCredentialsFromStorage = useCallback(async () => {
    chrome.storage.local.get(
      [STORAGE_KEYS.BSKY_PASSWORD, STORAGE_KEYS.BSKY_USER_ID],
      (result) => {
        setPassword(result[STORAGE_KEYS.BSKY_PASSWORD] || "");
        setIdentifier(result[STORAGE_KEYS.BSKY_USER_ID] || "");
      },
    );
  }, []);

  const searchBskyUser = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    saveCredentialsToStorage();

    const [{ url: currentUrl }] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!Object.values(TARGET_URLS_REGEX).some((r) => r.test(currentUrl))) {
      setErrorMessage(
        "Error: Invalid page. please open the 𝕏 following or blocking or list page.",
      );
      return;
    }

    const messageName = match(currentUrl)
      .with(
        P.when((url) => TARGET_URLS_REGEX.FOLLOW.test(url)),
        () => MESSAGE_NAMES.SEARCH_BSKY_USER_ON_FOLLOW_PAGE,
      )
      .with(
        P.when((url) => TARGET_URLS_REGEX.BLOCK.test(url)),
        () => MESSAGE_NAMES.SEARCH_BSKY_USER_ON_BLOCK_PAGE,
      )
      .with(
        P.when((url) => TARGET_URLS_REGEX.LIST.test(url)),
        () => MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE,
      )
      .run();

    setMessage(null);
    setIsLoading(true);

    const formattedIdentifier = (
      identifier.includes(".") ? identifier : `${identifier}.bsky.social`
    ).replace(/^@/, "");
    try {
      const res: { hasError: boolean; message: string } =
        await sendToContentScript({
          name: messageName,
          body: {
            identifier: formattedIdentifier,
            password,
            ...(authFactorToken && { authFactorToken: authFactorToken.trim() }),
          },
        });
      if (res.hasError) {
        if (res.message === AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE) {
          setIsShowAuthFactorTokenInput(true);
        } else {
          setErrorMessage(res.message);
        }
      } else {
        window.close();
      }
    } catch (e) {
      if (
        e.message?.includes("Could not establish connection") &&
        reloadCount < MAX_RELOAD_COUNT
      ) {
        setReloadCount((prev) => prev + 1);
        await reloadActiveTab();
        await new Promise((r) => setTimeout(r, 3000));
        await searchBskyUser();
      } else {
        setErrorMessage(
          "Error: Something went wrong. Please reload the web page and try again.",
        );
        console.error(e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCredentialsFromStorage();
  }, [loadCredentialsFromStorage]);

  return (
    <div className="px-5 pt-3 pb-4 w-[380px]">
      <h1 className="text-primary dark:text-white text-2xl font-thin flex gap-2 items-center">
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 48 48"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="4"
          >
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
        <label className="join w-full" htmlFor="identifier">
          <span className="join-item btn btn-sm btn-active cursor-default">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            name="identifier"
            placeholder="@you.bsky.social"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="input input-bordered input-sm w-full max-w-xs join-item focus:outline-none"
          />
        </label>
        <label className="join mt-2 w-full" htmlFor="password">
          <span className="join-item btn btn-sm btn-active cursor-default">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
              />
            </svg>
          </span>
          <input
            type="password"
            name="password"
            placeholder="your app password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered input-sm w-full max-w-xs join-item focus:outline-none"
          />
        </label>
        {isShowAuthFactorTokenInput && (
          <>
            <label className="join mt-2 w-full" htmlFor="authFactorToken">
              <span className="join-item btn btn-sm btn-active cursor-default">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
                  />
                </svg>
              </span>
              <input
                type="text"
                name="authFactorToken"
                placeholder="2FA token"
                value={authFactorToken}
                onChange={(e) => setAuthFactorToken(e.target.value)}
                className="input input-bordered input-sm w-full max-w-xs join-item focus:outline-none"
              />
            </label>
            <p className="mt-2 text-warning">
              A 2FA token has been sent to your email. Please enter the token
              above.
            </p>
          </>
        )}
        <button
          type="submit"
          className={
            "disabled:text-gray-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-300 mt-3 normal-case btn btn-primary btn-sm w-full"
          }
          disabled={isDisabled}
        >
          {isLoading && <span className="w-4 loading loading-spinner" />}
          {isLoading ? "Finding Bluesky Users" : "Find Bluesky Users"}
        </button>
        {isShowErrorMessage && (
          <div className="flex gap-2 items-center text-red-600 border border-red-600 p-2 rounded-md mt-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
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
              viewBox="0 0 24 24"
            >
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
  );
}

export default IndexPopup;
