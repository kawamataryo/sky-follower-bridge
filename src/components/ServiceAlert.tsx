import React from "react";

type Props = {
  serviceName: string;
};

const ServiceAlert = ({ serviceName }: Props) => {
  return (
    <div
      role="alert"
      className="alert border-warning p-2 gap-2 mb-4 text-warning rounded-xl"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 shrink-0 stroke-warning"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span className="text-xs">
        {chrome.i18n.getMessage("service_scanning_warning", [serviceName])}
      </span>
    </div>
  );
};

export default ServiceAlert;
