import type React from "react";

type props = {
  children: React.ReactNode;
  retryAction?: () => void;
};

const AlertError = ({ children, retryAction }: props) => (
  <div className="flex gap-2 items-center text-red-600 border border-red-600 p-2 rounded-md justify-between">
    <div className="flex gap-2 items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current flex-shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          stroke-linejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        {children}
        {!!retryAction && " Wait 3 minutes and press the restart button."}
      </span>
    </div>
    {!!retryAction && (
      <div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={() => {
            retryAction();
          }}
        >
          Restart
        </button>
      </div>
    )}
  </div>
);

export default AlertError;
