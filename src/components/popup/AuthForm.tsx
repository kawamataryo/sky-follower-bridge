import { BSKY_DOMAIN } from "~lib/constants";
import { getMessageWithLink } from "~lib/utils";

interface AuthFormProps {
  isLoading: boolean;
  password: string;
  setPassword: (value: string) => void;
  identifier: string;
  setIdentifier: (value: string) => void;
  authFactorToken: string;
  setAuthFactorToken: (value: string) => void;
  isShowAuthFactorTokenInput: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthForm = ({
  isLoading,
  password,
  setPassword,
  identifier,
  setIdentifier,
  authFactorToken,
  setAuthFactorToken,
  isShowAuthFactorTokenInput,
  onSubmit,
}: AuthFormProps) => {
  return (
    <form onSubmit={onSubmit} className="mt-5">
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
          {chrome.i18n.getMessage("handle_or_email")}
        </div>
        <input
          type="text"
          name="identifier"
          placeholder={`your-username.${BSKY_DOMAIN}`}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="input input-bordered input-sm w-full max-w-xs join-item focus:outline-none mt-1"
        />
      </label>
      <label className="mt-3 w-full block" htmlFor="password">
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
              d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
            />
          </svg>
          <p>
            {chrome.i18n.getMessage("password")}
            <br />
          </p>
        </div>
        <span className="text-xs">
          <span
            dangerouslySetInnerHTML={{
              __html: getMessageWithLink("recommended_to_use_app_password"),
            }}
          />
        </span>
        <input
          type="password"
          name="password"
          placeholder="abcd-1234-wxyz-7890"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered input-sm w-full max-w-xs join-item focus:outline-none mt-1"
        />
      </label>
      {isShowAuthFactorTokenInput && (
        <label className="mt-4 w-full block" htmlFor="authFactorToken">
          <div className="text-sm flex gap-2 items-center mb-1">
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
                d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
              />
            </svg>
            <p>Auth Factor Token</p>
          </div>
          <span className="mt-2">A 2FA token has been sent to your email.</span>
          <input
            type="text"
            name="authFactorToken"
            placeholder="1234-ABCD"
            value={authFactorToken}
            onChange={(e) => setAuthFactorToken(e.target.value)}
            className="input input-bordered input-sm w-full max-w-xs focus:outline-none mt-1"
          />
        </label>
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
          : chrome.i18n.getMessage("login")}
      </button>
    </form>
  );
};
