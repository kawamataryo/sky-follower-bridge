import type React from "react";

export const Hint = () => {
  const handleNavigate = (url: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.update(tabs[0].id, { url });
      }
    });
  };

  return (
    <div className="flex gap-2 items-start p-2 rounded-md text-xs bg-slate-100 dark:bg-slate-800">
      <div className="mt-[2px]">
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </div>
      <div className="flex flex-col gap-1 text-left">
        <p>{chrome.i18n.getMessage("hint_title")}</p>
        <ul className="list-disc space-y-1 list-inside">
          <li className="flex-1">
            <button
              type="button"
              onClick={() => handleNavigate("https://x.com/following")}
              className="text-blue-400 hover:underline"
            >
              𝕏 Following list
            </button>
          </li>
          <li className="flex-1">
            <button
              type="button"
              onClick={() =>
                handleNavigate("https://x.com/settings/blocked/all")
              }
              className="text-blue-400 hover:underline"
            >
              𝕏 Blocked accounts
            </button>
          </li>
          <li className="flex-1">𝕏 List members</li>
          <li className="flex-1">
            <button
              type="button"
              onClick={() => handleNavigate("https://www.threads.net")}
              className="text-blue-400 hover:underline"
            >
              Threads
            </button>
            {" or "}
            <button
              type="button"
              onClick={() => handleNavigate("https://www.instagram.com")}
              className="text-blue-400 hover:underline"
            >
              Instagram
            </button>
            {" , "}
            <button
              type="button"
              onClick={() => handleNavigate("https://www.tiktok.com")}
              className="text-blue-400 hover:underline"
            >
              TikTok
            </button>
            {" following page"}
          </li>
        </ul>
      </div>
    </div>
  );
};
