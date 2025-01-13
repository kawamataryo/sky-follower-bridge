import type React from "react";

export const Contact = () => {
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
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>
      <div className="flex flex-col gap-1 text-left">
        <p
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage("contact_title"),
          }}
        />
      </div>
    </div>
  );
};
