import type { AuthMethod } from "~hooks/useAuth";
import { useTypeaheadSearch } from "~hooks/useTypeaheadSearch";
import { BSKY_DOMAIN } from "~lib/constants";
import { TypeaheadDropdown } from "./TypeaheadDropdown";

interface AuthFormProps {
  isLoading: boolean;
  identifier: string;
  setIdentifier: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  authFactorToken: string;
  setAuthFactorToken: (value: string) => void;
  isShowAuthFactorTokenInput: boolean;
  authMethod: AuthMethod;
  setAuthMethod: (value: AuthMethod) => void;
  service: string;
  setService: (value: string) => void;
  onSubmit: (e?: React.FormEvent, identifierOverride?: string) => void;
}

export const AuthForm = ({
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
  service,
  setService,
  onSubmit,
}: AuthFormProps) => {
  const {
    suggestions,
    isSearching,
    showDropdown,
    activeIndex,
    onInputChange,
    onSelect,
    onClose,
    onFocus,
    onKeyDown,
  } = useTypeaheadSearch({
    identifier,
    setIdentifier,
    onLogin: (handle) => onSubmit(undefined, handle),
    authMethod,
  });

  return (
    <div className="mt-5">
      <div role="tablist" className="tabs tabs-bordered tabs-sm">
        <button
          type="button"
          role="tab"
          className={`tab ${authMethod === "oauth" ? "tab-active" : ""}`}
          onClick={() => setAuthMethod("oauth")}
        >
          Bluesky
        </button>
        <button
          type="button"
          role="tab"
          className={`tab ${authMethod === "app-password" ? "tab-active" : ""}`}
          onClick={() => setAuthMethod("app-password")}
        >
          App Password
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-3">
        <label className="w-full block" htmlFor="identifier">
          <div className="text-sm flex gap-2 items-center">
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
            {authMethod === "app-password"
              ? chrome.i18n.getMessage("handle_or_email")
              : chrome.i18n.getMessage("handle")}
          </div>
          <div className="relative">
            <input
              type="text"
              name="identifier"
              placeholder={`your-username.${BSKY_DOMAIN}`}
              value={identifier}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={onFocus}
              onBlur={() => setTimeout(onClose, 150)}
              autoComplete="off"
              className="input input-bordered input-sm w-full max-w-xs focus:outline-none mt-1"
            />
            {authMethod === "oauth" && showDropdown && (
              <TypeaheadDropdown
                suggestions={suggestions}
                isSearching={isSearching}
                activeIndex={activeIndex}
                onSelect={onSelect}
              />
            )}
          </div>
        </label>

        {authMethod === "app-password" && (
          <>
            <label className="w-full block mt-2" htmlFor="password">
              <div className="text-sm flex gap-2 items-center">
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
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                {chrome.i18n.getMessage("app_password")}
              </div>
              <input
                type="password"
                name="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered input-sm w-full max-w-xs focus:outline-none mt-1"
              />
            </label>

            <label className="w-full block mt-2" htmlFor="service">
              <div className="text-sm flex gap-2 items-center">
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
                    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
                {chrome.i18n.getMessage("service_url")}
              </div>
              <input
                type="text"
                name="service"
                placeholder={`https://${BSKY_DOMAIN}`}
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="input input-bordered input-sm w-full max-w-xs focus:outline-none mt-1"
              />
            </label>

            {isShowAuthFactorTokenInput && (
              <label className="w-full block mt-2" htmlFor="authFactorToken">
                <div className="text-sm flex gap-2 items-center">
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
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                  {chrome.i18n.getMessage("two_factor_auth_code")}
                </div>
                <input
                  type="text"
                  name="authFactorToken"
                  placeholder="XXXX-XXXX"
                  value={authFactorToken}
                  onChange={(e) => setAuthFactorToken(e.target.value)}
                  className="input input-bordered input-sm w-full max-w-xs focus:outline-none mt-1"
                />
              </label>
            )}
          </>
        )}

        {authMethod === "oauth" && (
          <p className="text-xs mt-2 opacity-75">
            {chrome.i18n.getMessage("oauth_sign_in_description")}
          </p>
        )}

        <button
          type="submit"
          className={
            "disabled:text-gray-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-300 mt-4 normal-case btn btn-primary btn-sm w-full"
          }
          disabled={isLoading}
        >
          {isLoading && <span className="w-4 loading loading-spinner" />}
          {isLoading
            ? chrome.i18n.getMessage("logging_in")
            : authMethod === "oauth"
              ? chrome.i18n.getMessage("sign_in_with_bluesky")
              : chrome.i18n.getMessage("login")}
        </button>
      </form>
    </div>
  );
};
