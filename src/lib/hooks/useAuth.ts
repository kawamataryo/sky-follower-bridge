import { sendToBackground } from "@plasmohq/messaging";
import { useCallback, useEffect, useState } from "react";
import {
  AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE,
  BSKY_DOMAIN,
  DOCUMENT_LINK,
  INVALID_IDENTIFIER_OR_PASSWORD_ERROR_MESSAGE,
  RATE_LIMIT_ERROR_MESSAGE,
  STORAGE_KEYS,
} from "~lib/constants";
import {
  getFromChromeStorage,
  removeFromChromeStorage,
  setToChromeStorage,
} from "~lib/utils";
import { useErrorMessage } from "./useErrorMessage";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [authFactorToken, setAuthFactorToken] = useState("");
  const [isShowAuthFactorTokenInput, setIsShowAuthFactorTokenInput] =
    useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticatedLoading, setIsAuthenticatedLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const { errorMessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();

  const saveCredentialsToStorage = async () => {
    await setToChromeStorage(STORAGE_KEYS.BSKY_USER_ID, identifier);
    await setToChromeStorage(STORAGE_KEYS.BSKY_PASSWORD, password);
  };

  const clearPasswordFromStorage = async () => {
    await removeFromChromeStorage(STORAGE_KEYS.BSKY_PASSWORD);
  };

  const saveShowAuthFactorTokenInputToStorage = async (value: boolean) => {
    await setToChromeStorage(
      STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT,
      value,
    );
  };

  const saveSessionToStorage = async (session: string) => {
    await setToChromeStorage(STORAGE_KEYS.BSKY_CLIENT_SESSION, session);
  };

  const loadCredentialsFromStorage = useCallback(async () => {
    const storage = await getFromChromeStorage([
      STORAGE_KEYS.BSKY_USER_ID,
      STORAGE_KEYS.BSKY_PASSWORD,
      STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT,
      STORAGE_KEYS.BSKY_CLIENT_SESSION,
    ]);
    setIdentifier(storage[STORAGE_KEYS.BSKY_USER_ID] || "");
    setPassword(storage[STORAGE_KEYS.BSKY_PASSWORD] || "");
    setIsShowAuthFactorTokenInput(
      storage[STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT] || false,
    );
    return {
      identifier: storage[STORAGE_KEYS.BSKY_USER_ID],
      password: storage[STORAGE_KEYS.BSKY_PASSWORD],
      session: storage[STORAGE_KEYS.BSKY_CLIENT_SESSION],
      isShowAuthFactorTokenInput:
        storage[STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT],
    };
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

  const logout = async () => {
    setIsLoading(true);
    try {
      await removeFromChromeStorage([
        STORAGE_KEYS.BSKY_CLIENT_SESSION,
        STORAGE_KEYS.BSKY_PASSWORD,
        STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT,
      ]);
      setIsAuthenticated(false);
      setPassword("");
      setAuthFactorToken("");
      setIsShowAuthFactorTokenInput(false);
      clearErrorMessage();
    } catch (e) {
      setErrorMessage(
        chrome.i18n.getMessage("error_something_went_wrong"),
        DOCUMENT_LINK.OTHER_ERROR,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!validateForm()) {
      return;
    }
    await saveCredentialsToStorage();

    clearErrorMessage();
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

      await saveSessionToStorage(session);
      await clearPasswordFromStorage();
      await saveShowAuthFactorTokenInputToStorage(false);
      setIsAuthenticated(true);
    } catch (e) {
      setErrorMessage(
        chrome.i18n.getMessage("error_something_went_wrong"),
        DOCUMENT_LINK.OTHER_ERROR,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const { session } = await loadCredentialsFromStorage();
      if (!session) {
        setIsAuthenticated(false);
        return;
      }
      const { result, error } = await sendToBackground({
        name: "getMyProfile",
        body: {
          session,
        },
      });
      if (error) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      setDisplayName(result.displayName);
      setAvatar(result.avatar);
    };

    initialize()
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsAuthenticatedLoading(false);
      });
  }, [loadCredentialsFromStorage]);

  return {
    isLoading,
    password,
    setPassword,
    identifier,
    setIdentifier,
    authFactorToken,
    setAuthFactorToken,
    isShowAuthFactorTokenInput,
    errorMessage,
    isAuthenticated,
    isAuthenticatedLoading,
    displayName,
    avatar,
    login,
    logout,
  };
};
