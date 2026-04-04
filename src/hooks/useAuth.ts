import { sendToBackground } from "@plasmohq/messaging";
import destr from "destr";
import { useCallback, useEffect, useState } from "react";
import {
  getChromeStorage,
  removeChromeStorageItems,
  setToChromeStorage,
} from "~lib/chromeHelper";
import {
  AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE,
  BSKY_DOMAIN,
  BSKY_OAUTH_CLIENT_ID,
  BSKY_OAUTH_REDIRECT_URI,
  DOCUMENT_LINK,
  INVALID_IDENTIFIER_OR_PASSWORD_ERROR_MESSAGE,
  STORAGE_KEYS,
} from "~lib/constants";
import { debugLog } from "~lib/utils";
import type { SessionData } from "~types";
import { useErrorMessage } from "./useErrorMessage";

export type AuthMethod = "oauth" | "app-password";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [authFactorToken, setAuthFactorToken] = useState("");
  const [isShowAuthFactorTokenInput, setIsShowAuthFactorTokenInput] =
    useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("oauth");
  const [service, setService] = useState(`https://${BSKY_DOMAIN}`);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticatedLoading, setIsAuthenticatedLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const { errorMessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();

  const saveIdentifierToStorage = async () => {
    await setToChromeStorage(STORAGE_KEYS.BSKY_USER_ID, identifier);
  };

  const saveSessionToStorage = async (session: SessionData) => {
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
      [STORAGE_KEYS.BSKY_CLIENT_SESSION]: SessionData;
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
    if (authMethod === "oauth") {
      if (!BSKY_OAUTH_CLIENT_ID || !BSKY_OAUTH_REDIRECT_URI) {
        setErrorMessage("OAuth is not configured.", DOCUMENT_LINK.OTHER_ERROR);
        return false;
      }
    } else {
      if (!password) {
        setErrorMessage(chrome.i18n.getMessage("error_enter_password"));
        return false;
      }
    }
    return true;
  };

  const getSessionAuthMethod = (session: SessionData): AuthMethod => {
    if (session?.authMethod) {
      return session.authMethod;
    }
    // Legacy sessions without authMethod are OAuth
    return "oauth";
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { session } = await loadCredentialsFromStorage();
      const currentAuthMethod = session
        ? getSessionAuthMethod(session)
        : "oauth";

      const { error } = await sendToBackground({
        name: "logout",
        body: { authMethod: currentAuthMethod },
      });
      if (error) {
        throw new Error(error.message);
      }
      await removeChromeStorageItems([STORAGE_KEYS.BSKY_CLIENT_SESSION]);
      setIsAuthenticated(false);
      setIsShowAuthFactorTokenInput(false);
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
    async (session: SessionData) => {
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

  const login = async (e?: React.FormEvent, identifierOverride?: string) => {
    if (e) {
      e.preventDefault();
    }
    if (identifierOverride) {
      setIdentifier(identifierOverride);
    }
    if (!identifierOverride && !validateForm()) {
      return;
    }
    await saveIdentifierToStorage();

    clearErrorMessage();
    setIsLoading(true);

    try {
      if (authMethod === "app-password") {
        await loginWithAppPassword();
      } else {
        await loginWithOAuth(identifierOverride);
      }
    } catch (_e) {
      setErrorMessage(
        chrome.i18n.getMessage("error_something_went_wrong"),
        DOCUMENT_LINK.OTHER_ERROR,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (identifierOverride?: string) => {
    const rawIdentifier = identifierOverride ?? identifier;
    const formattedIdentifier = (
      rawIdentifier.includes(".")
        ? rawIdentifier
        : `${rawIdentifier}.${BSKY_DOMAIN}`
    ).replace(/^@/, "");

    const { session, profile, error } = await sendToBackground({
      name: "login",
      body: {
        identifier: formattedIdentifier,
        authMethod: "oauth",
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
      await removeChromeStorageItems([STORAGE_KEYS.BSKY_CLIENT_SESSION]);
      setErrorMessage(
        chrome.i18n.getMessage("error_something_went_wrong"),
        DOCUMENT_LINK.OTHER_ERROR,
      );
    }
    setIsAuthenticated(isProfileLoaded);
  };

  const loginWithAppPassword = async () => {
    const formattedIdentifier = (
      identifier.includes(".") ? identifier : `${identifier}.${BSKY_DOMAIN}`
    ).replace(/^@/, "");

    const { session, profile, error } = await sendToBackground({
      name: "login",
      body: {
        identifier: formattedIdentifier,
        password,
        authFactorToken: authFactorToken || undefined,
        service,
        authMethod: "app-password",
      },
    });

    if (error) {
      if (error.message.includes(AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE)) {
        setIsShowAuthFactorTokenInput(true);
        setErrorMessage(
          chrome.i18n.getMessage("error_two_factor_authentication_required"),
          DOCUMENT_LINK.TWO_FACTOR_AUTHENTICATION,
        );
        return;
      }
      if (
        error.message.includes(INVALID_IDENTIFIER_OR_PASSWORD_ERROR_MESSAGE)
      ) {
        setErrorMessage(
          chrome.i18n.getMessage("error_invalid_identifier_or_password"),
          DOCUMENT_LINK.LOGIN_ERROR,
        );
        return;
      }
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
      await removeChromeStorageItems([STORAGE_KEYS.BSKY_CLIENT_SESSION]);
      setErrorMessage(
        chrome.i18n.getMessage("error_something_went_wrong"),
        DOCUMENT_LINK.OTHER_ERROR,
      );
    }
    setIsAuthenticated(isProfileLoaded);
  };

  useEffect(() => {
    const initialize = async () => {
      const { session } = await loadCredentialsFromStorage();
      if (!session) {
        setIsAuthenticated(false);
        return;
      }
      // Normalize legacy sessions
      const normalizedSession: SessionData = session.authMethod
        ? session
        : { ...session, authMethod: "oauth" as const };

      const isProfileLoaded = await loadAndSetProfile(normalizedSession);
      if (!isProfileLoaded) {
        await removeChromeStorageItems([STORAGE_KEYS.BSKY_CLIENT_SESSION]);
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
    password,
    setPassword,
    authFactorToken,
    setAuthFactorToken,
    isShowAuthFactorTokenInput,
    authMethod,
    setAuthMethod,
    errorMessage,
    isAuthenticated,
    isAuthenticatedLoading,
    displayName,
    avatar,
    service,
    setService,
    login,
    logout,
  };
};
