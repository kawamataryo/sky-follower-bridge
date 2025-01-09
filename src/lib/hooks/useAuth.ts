import { sendToBackground } from "@plasmohq/messaging";
import { useCallback, useEffect, useState } from "react";
import {
  AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE,
  BSKY_DOMAIN,
  DOCUMENT_LINK,
  INVALID_IDENTIFIER_OR_PASSWORD_ERROR_MESSAGE,
  MESSAGE_TYPE,
  RATE_LIMIT_ERROR_MESSAGE,
  STORAGE_KEYS,
} from "~lib/constants";

interface Message {
  type: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
  message: string;
  documentLink?: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [authFactorToken, setAuthFactorToken] = useState("");
  const [isShowAuthFactorTokenInput, setIsShowAuthFactorTokenInput] =
    useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticatedLoading, setIsAuthenticatedLoading] =
    useState(true);

  const setErrorMessage = (message: string, documentLink?: string) => {
    setMessage({ type: MESSAGE_TYPE.ERROR, message, documentLink });
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
        STORAGE_KEYS.BSKY_CLIENT_SESSION,
      ],
      (result) => {
        setIdentifier(result[STORAGE_KEYS.BSKY_USER_ID] || "");
        setPassword(result[STORAGE_KEYS.BSKY_PASSWORD] || "");
        setIsShowAuthFactorTokenInput(
          result[STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT] || false,
        );
        setIsAuthenticated(!!result[STORAGE_KEYS.BSKY_CLIENT_SESSION]);
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

  const logout = async () => {
    setIsLoading(true);
    try {
      await chrome.storage.local.remove([
        STORAGE_KEYS.BSKY_CLIENT_SESSION,
        STORAGE_KEYS.BSKY_PASSWORD,
        STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT,
      ]);
      setIsAuthenticated(false);
      setPassword("");
      setAuthFactorToken("");
      setIsShowAuthFactorTokenInput(false);
      setMessage(null);
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
    saveCredentialsToStorage();

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
    loadCredentialsFromStorage();
    setIsAuthenticatedLoading(false);
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
    message,
    isAuthenticated,
    isAuthenticatedLoading,
    login,
    logout,
  };
};
