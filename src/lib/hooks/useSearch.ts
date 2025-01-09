import { sendToContentScript } from "@plasmohq/messaging";
import { useState } from "react";
import { P, match } from "ts-pattern";
import {
  DOCUMENT_LINK,
  MAX_RELOAD_COUNT,
  MESSAGE_NAMES,
  MESSAGE_TYPE,
  STORAGE_KEYS,
  TARGET_URLS_REGEX,
} from "~lib/constants";
import { isFirefox } from "~lib/utils";

interface Message {
  type: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
  message: string;
  documentLink?: string;
}

export const useSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [message, setMessage] = useState<Message | null>(null);

  const setErrorMessage = (message: string, documentLink?: string) => {
    setMessage({ type: MESSAGE_TYPE.ERROR, message, documentLink });
  };

  const reloadActiveTab = async () => {
    const [{ id: tabId }] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    await chrome.tabs.reload(tabId);
  };

  const retrySearch = async () => {
    setMessage(null);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 3000));
    await searchBskyUser();
  };

  const handleLoginError = async () => {
    await chrome.storage.local.remove([
      STORAGE_KEYS.BSKY_CLIENT_SESSION,
      STORAGE_KEYS.BSKY_PASSWORD,
      STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT,
    ]);
    window.location.reload();
  };

  const searchBskyUser = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const [{ url: currentUrl }] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!Object.values(TARGET_URLS_REGEX).some((r) => r.test(currentUrl))) {
      if (!isFirefox() && currentUrl?.includes("https://x.com/")) {
        chrome.tabs.update({ url: "https://x.com/following" });
        await retrySearch();
        return;
      }
      setErrorMessage(
        chrome.i18n.getMessage("error_invalid_page"),
        DOCUMENT_LINK.PAGE_ERROR,
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
      .with(
        P.when((url) => TARGET_URLS_REGEX.THREADS.test(url)),
        () => MESSAGE_NAMES.SEARCH_BSKY_USER_ON_THREADS_PAGE,
      )
      .with(
        P.when((url) => TARGET_URLS_REGEX.INSTAGRAM.test(url)),
        () => MESSAGE_NAMES.SEARCH_BSKY_USER_ON_INSTAGRAM_PAGE,
      )
      .run();

    await chrome.storage.local.set({
      [STORAGE_KEYS.BSKY_MESSAGE_NAME]: messageName,
    });

    setMessage(null);
    setIsLoading(true);

    try {
      const { hasError, message: errorMessage } = await sendToContentScript({
        name: messageName,
      });
      if (hasError) {
        if (errorMessage.includes("Invalid page")) {
          setErrorMessage(errorMessage, DOCUMENT_LINK.PAGE_ERROR);
        } else if (
          errorMessage.toLowerCase().includes("unauthorized") ||
          errorMessage.toLowerCase().includes("authentication") ||
          errorMessage.toLowerCase().includes("login")
        ) {
          await handleLoginError();
          return;
        } else {
          setErrorMessage(errorMessage, DOCUMENT_LINK.OTHER_ERROR);
        }
        return;
      }

      window.close();
    } catch (e) {
      if (
        e.message?.includes("Could not establish connection") &&
        reloadCount < MAX_RELOAD_COUNT
      ) {
        setReloadCount((prev) => prev + 1);
        await reloadActiveTab();
        await retrySearch();
      } else if (
        e.message?.toLowerCase().includes("unauthorized") ||
        e.message?.toLowerCase().includes("authentication") ||
        e.message?.toLowerCase().includes("login")
      ) {
        await handleLoginError();
      } else {
        setErrorMessage(
          chrome.i18n.getMessage("error_something_went_wrong"),
          DOCUMENT_LINK.OTHER_ERROR,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    message,
    searchBskyUser,
  };
};
