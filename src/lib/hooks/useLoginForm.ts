import { sendToBackground, sendToContentScript } from "@plasmohq/messaging";
import { type FormEvent, useCallback, useState } from "react";
import { P, match } from "ts-pattern";
import {
  AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE,
  BSKY_DOMAIN,
  DOCUMENT_LINK,
  INVALID_IDENTIFIER_OR_PASSWORD_ERROR_MESSAGE,
  MAX_RELOAD_COUNT,
  MESSAGE_NAMES,
  MESSAGE_TYPE,
  RATE_LIMIT_ERROR_MESSAGE,
  STORAGE_KEYS,
  TARGET_URLS_REGEX,
} from "~lib/constants";
import { isFirefox } from "~lib/utils";

interface Message {
  type: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
  message: string;
  documentLink?: string;
}

export const useLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [reloadCount, setReloadCount] = useState(0);
  const [authFactorToken, setAuthFactorToken] = useState("");
  const [isShowAuthFactorTokenInput, setIsShowAuthFactorTokenInput] =
    useState(false);
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

  const saveCredentialsToStorage = async () => {
    await chrome.storage.local.set({
      [STORAGE_KEYS.BSKY_USER_ID]: identifier,
      [STORAGE_KEYS.BSKY_PASSWORD]: password,
    });
  };

  const clearPasswordFromStorage = async () => {
    await chrome.storage.local.remove([STORAGE_KEYS.BSKY_PASSWORD]);
  };

  const saveShowAuthFactorTokenInputToStorage = async (value: boolean) => {
    await chrome.storage.local.set({
      [STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT]: value,
    });
  };

  const loadCredentialsFromStorage = useCallback(async () => {
    chrome.storage.local.get(
      [
        STORAGE_KEYS.BSKY_USER_ID,
        STORAGE_KEYS.BSKY_PASSWORD,
        STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT,
      ],
      (result) => {
        setIdentifier(result[STORAGE_KEYS.BSKY_USER_ID] || "");
        setPassword(result[STORAGE_KEYS.BSKY_PASSWORD] || "");
        setIsShowAuthFactorTokenInput(
          result[STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT] || false,
        );
      },
    );
  }, []);

  const validateForm = () => {
    if (!password && !identifier) {
      setErrorMessage(
        chrome.i18n.getMessage("error_enter_identifier_and_password"),
      );
      return false;
    }
    if (!password) {
      setErrorMessage(chrome.i18n.getMessage("error_enter_password"));
      return false;
    }
    if (!identifier) {
      setErrorMessage(chrome.i18n.getMessage("error_enter_identifier"));
      return false;
    }
    if (isShowAuthFactorTokenInput && !authFactorToken) {
      setErrorMessage(chrome.i18n.getMessage("error_enter_auth_factor_token"));
      return false;
    }
    return true;
  };

  const retrySearch = async () => {
    setMessage(null);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 3000));
    await searchBskyUser();
  };

  const searchBskyUser = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!validateForm()) {
      return;
    }
    saveCredentialsToStorage();

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

    const formattedIdentifier = (
      identifier.includes(".") ? identifier : `${identifier}.${BSKY_DOMAIN}`
    ).replace(/^@/, "");

    try {
      const { session, error } = await sendToBackground({
        name: "login",
        body: {
          identifier: formattedIdentifier,
          password,
          ...(authFactorToken && { authFactorToken: authFactorToken }),
        },
      });
      if (error) {
        if (error.message.includes(AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE)) {
          setIsShowAuthFactorTokenInput(true);
          await saveShowAuthFactorTokenInputToStorage(true);
        } else if (error.message.includes(RATE_LIMIT_ERROR_MESSAGE)) {
          setErrorMessage(error.message, DOCUMENT_LINK.RATE_LIMIT_ERROR);
        } else if (
          error.message.includes(INVALID_IDENTIFIER_OR_PASSWORD_ERROR_MESSAGE)
        ) {
          setErrorMessage(
            chrome.i18n.getMessage("error_invalid_identifier_or_password"),
            DOCUMENT_LINK.LOGIN_ERROR,
          );
        } else {
          setErrorMessage(error.message, DOCUMENT_LINK.LOGIN_ERROR);
        }
        return;
      }

      await chrome.storage.local.set({
        [STORAGE_KEYS.BSKY_CLIENT_SESSION]: session,
      });

      const { hasError, message: errorMessage } = await sendToContentScript({
        name: messageName,
      });
      if (hasError) {
        if (errorMessage.includes("Invalid page")) {
          setErrorMessage(errorMessage, DOCUMENT_LINK.PAGE_ERROR);
        } else {
          setErrorMessage(errorMessage, DOCUMENT_LINK.OTHER_ERROR);
        }
        return;
      }

      await clearPasswordFromStorage();
      await saveShowAuthFactorTokenInputToStorage(false);
      window.close();
    } catch (e) {
      if (
        e.message?.includes("Could not establish connection") &&
        reloadCount < MAX_RELOAD_COUNT
      ) {
        setReloadCount((prev) => prev + 1);
        await reloadActiveTab();
        await retrySearch();
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
    password,
    setPassword,
    identifier,
    setIdentifier,
    authFactorToken,
    setAuthFactorToken,
    isShowAuthFactorTokenInput,
    message,
    searchBskyUser,
    loadCredentialsFromStorage,
  };
};
