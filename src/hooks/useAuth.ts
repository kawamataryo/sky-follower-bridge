import { sendToBackground } from "@plasmohq/messaging";
import destr from "destr";
import { useCallback, useEffect, useState } from "react";
import {
  getChromeStorage,
  removeChromeStorageItems,
  setToChromeStorage,
} from "~lib/chromeHelper";
import {
  BSKY_DOMAIN,
  BSKY_OAUTH_CLIENT_ID,
  BSKY_OAUTH_REDIRECT_URI,
  DOCUMENT_LINK,
  STORAGE_KEYS,
} from "~lib/constants";
import { debugLog } from "~lib/utils";
import type { OAuthSessionData } from "~types";
import { useErrorMessage } from "./useErrorMessage";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticatedLoading, setIsAuthenticatedLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const { errorMessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();

  const saveIdentifierToStorage = async () => {
    await setToChromeStorage(STORAGE_KEYS.BSKY_USER_ID, identifier);
  };

  const saveSessionToStorage = async (session: OAuthSessionData) => {
    await setToChromeStorage(STORAGE_KEYS.BSKY_CLIENT_SESSION, session);
  };

  const applyProfile = useCallback(
    (profile: { avatar?: string; displayName?: string }) => {
      setDisplayName(profile.displayName || "");
      setAvatar(profile.avatar || "");
    },
    [],
  );

  const loadCredentialsFromStorage = useCallback(async () => {
    const storage = await getChromeStorage<{
      [STORAGE_KEYS.BSKY_USER_ID]: string;
      [STORAGE_KEYS.BSKY_CLIENT_SESSION]: OAuthSessionData;
    }>(null);

    setIdentifier(storage?.[STORAGE_KEYS.BSKY_USER_ID] || "");
    return {
      identifier: storage?.[STORAGE_KEYS.BSKY_USER_ID],
      session: storage?.[STORAGE_KEYS.BSKY_CLIENT_SESSION],
    };
  }, []);

  const validateForm = () => {
    if (!identifier) {
      setErrorMessage(chrome.i18n.getMessage("error_enter_identifier"));
      return false;
    }
    if (!BSKY_OAUTH_CLIENT_ID || !BSKY_OAUTH_REDIRECT_URI) {
      setErrorMessage("OAuth is not configured.", DOCUMENT_LINK.OTHER_ERROR);
      return false;
    }
    return true;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await sendToBackground({ name: "logout", body: {} });
      if (error) {
        throw new Error(error.message);
      }
      await removeChromeStorageItems([STORAGE_KEYS.BSKY_CLIENT_SESSION]);
      setIsAuthenticated(false);
      clearErrorMessage();
    } catch (e) {
      debugLog(e);
      setErrorMessage(
        chrome.i18n.getMessage("error_something_went_wrong"),
        DOCUMENT_LINK.OTHER_ERROR,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadAndSetProfile = useCallback(
    async (session: OAuthSessionData) => {
      const { result, error } = await sendToBackground({
        name: "getMyProfile",
        body: {
          session,
        },
      });
      if (error) {
        debugLog(error);
        return false;
      }
      const parsedResult = destr<{
        displayName: string;
        avatar: string;
      }>(result);
      debugLog(parsedResult);
      applyProfile(parsedResult);
      return true;
    },
    [applyProfile],
  );

  const login = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!validateForm()) {
      return;
    }
    await saveIdentifierToStorage();

    clearErrorMessage();
    setIsLoading(true);

    const formattedIdentifier = (
      identifier.includes(".") ? identifier : `${identifier}.${BSKY_DOMAIN}`
    ).replace(/^@/, "");

    try {
      const { session, profile, error } = await sendToBackground({
        name: "login",
        body: {
          identifier: formattedIdentifier,
        },
      });
      if (error) {
        setErrorMessage(error.message, DOCUMENT_LINK.LOGIN_ERROR);
        return;
      }

      await saveSessionToStorage(session);
      if (profile) {
        applyProfile(profile);
        setIsAuthenticated(true);
        return;
      }
      const isProfileLoaded = await loadAndSetProfile(session);
      if (!isProfileLoaded) {
        setErrorMessage(
          chrome.i18n.getMessage("error_something_went_wrong"),
          DOCUMENT_LINK.OTHER_ERROR,
        );
      }
      setIsAuthenticated(isProfileLoaded);
    } catch (_e) {
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
      const isProfileLoaded = await loadAndSetProfile(session);
      if (!isProfileLoaded) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
    };

    initialize()
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsAuthenticatedLoading(false);
      });
  }, [loadCredentialsFromStorage, loadAndSetProfile]);

  return {
    isLoading,
    identifier,
    setIdentifier,
    errorMessage,
    isAuthenticated,
    isAuthenticatedLoading,
    displayName,
    avatar,
    login,
    logout,
  };
};
