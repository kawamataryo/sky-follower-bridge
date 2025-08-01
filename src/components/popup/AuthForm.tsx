import { BSKY_DOMAIN } from "~lib/constants";
import { getMessageWithLink } from "~lib/utils";
interface AuthFormProps {
  isLoading: boolean;
  password: string;
  setPassword: (value: string) => void;
  domain: string;
  setDomain: (value: string) => void;
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
  domain,
  setDomain,
  identifier,
  setIdentifier,
  authFactorToken,
  setAuthFactorToken,
  isShowAuthFactorTokenInput,
  onSubmit,
}: AuthFormProps) => {
  return (
    <form onSubmit={onSubmit} className="mt-5">
      <label className="w-full block domain" htmlFor="domain">
        <div className="text-sm flex gap-2 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12,1A11,11,0,1,0,23,12,10.95,10.95,0,0,0,12,1ZM20.05,8H17.6a13.9,13.9,0,0,0-1.5-4A9.25,9.25,0,0,1,20.05,8ZM21,12a8.75,8.75,0,0,1-.25,2H17.9c0-.65,0-1.3,0-2s0-1.35,0-2h3.85A8.75,8.75,0,0,1,21,12ZM3,12a8.75,8.75,0,0,1,.25-2h3.85c0,.65,0,1.3,0,2s0,1.35,0,2H3.25A8.75,8.75,0,0,1,3,12Zm5,0c0-.7,0-1.35,0-2H11v4H8.1C8,13.35,8,12.7,8,12ZM13,3.35a5.85,5.85,0,0,1,1.5,1.85A10.85,10.85,0,0,1,15.55,8H13Zm-2,0V8H8.45A10.85,10.85,0,0,1,9.5,5.2,5.85,5.85,0,0,1,11,3.35ZM11,16v4.65a5.85,5.85,0,0,1-1.5-1.85A10.85,10.85,0,0,1,8.45,16Zm2,4.65V16h2.55A10.85,10.85,0,0,1,14.5,18.8,5.85,5.85,0,0,1,13,20.65ZM13,14v-4h2.9c0,.65,0,1.3,0,2s0,1.35,0,2ZM7.9,4a13.9,13.9,0,0,0-1.5,4H3.95A9.25,9.25,0,0,1,7.9,4ZM3.95,16h2.45a13.9,13.9,0,0,0,1.5,4A9.25,9.25,0,0,1,3.95,16Zm12.15,4a13.9,13.9,0,0,0,1.5-4h2.45A9.25,9.25,0,0,1,16.1,20Z" />
          </svg>
          Domain
        </div>

        <input
          type="text"
          name="domain"
          placeholder="bsky.social"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="input input-bordered input-sm w-full max-w-xs join-item focus:outline-none mt-1"
        />
      </label>
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
          placeholder={`@your-username.${BSKY_DOMAIN}`}
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
