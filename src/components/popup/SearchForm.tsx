interface SearchFormProps {
  isLoading: boolean;
  displayName: string;
  avatar: string;
  onSubmit: (e: React.FormEvent) => void;
  onLogout: () => void;
}

export const SearchForm = ({
  isLoading,
  displayName,
  avatar,
  onSubmit,
  onLogout,
}: SearchFormProps) => {
  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="flex justify-end gap-2">
        <div className="flex gap-1 items-center">
          <img
            src={avatar}
            alt={displayName}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-sm max-w-[150px] truncate">{displayName}</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm dark:hover:text-gray-200 flex gap-1 items-center"
        >
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
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
            />
          </svg>
          {chrome.i18n.getMessage("logout")}
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <button
          type="submit"
          className={
            "disabled:text-gray-600 dark:disabled:bg-gray-700 dark:disabled:text-gray-300 normal-case btn btn-primary btn-sm w-full flex gap-2 items-center justify-center"
          }
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="w-4 loading loading-spinner" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          )}
          {isLoading
            ? chrome.i18n.getMessage("finding_bluesky_users")
            : chrome.i18n.getMessage("find_bluesky_users")}
        </button>
      </form>
    </div>
  );
};
