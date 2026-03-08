import { BSKY_DOMAIN } from "~lib/constants";

interface AuthFormProps {
  isLoading: boolean;
  identifier: string;
  setIdentifier: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthForm = ({
  isLoading,
  identifier,
  setIdentifier,
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
      <p className="text-xs mt-2 opacity-75">
        {chrome.i18n.getMessage("oauth_sign_in_description")}
      </p>
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
          : chrome.i18n.getMessage("sign_in_with_bluesky")}
      </button>
    </form>
  );
};
