import type { AuthMethod } from "~hooks/useAuth";
import { BSKY_DOMAIN } from "~lib/constants";

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
  onSubmit: (e: React.FormEvent) => void;
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
  onSubmit,
}: AuthFormProps) => {
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
          <input
            type="text"
            name="identifier"
            placeholder={`your-username.${BSKY_DOMAIN}`}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="input input-bordered input-sm w-full max-w-xs focus:outline-none mt-1"
          />
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
