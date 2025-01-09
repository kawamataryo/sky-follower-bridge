import { getMessageWithLink } from "~lib/utils";

interface ErrorMessageProps {
  message: string;
  documentLink?: string;
}

export const ErrorMessage = ({ message, documentLink }: ErrorMessageProps) => {
  return (
    <div className="flex gap-2 items-center text-red-600 border border-red-600 p-2 rounded-md mt-2 text-xs">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current flex-shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        {message}{" "}
        {documentLink && (
          <a
            href={documentLink}
            target="_blank"
            rel="noreferrer"
            className="link mx-1"
          >
            {chrome.i18n.getMessage("learn_more")}
          </a>
        )}{" "}
        <span
          className="text-xs"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: getMessageWithLink("error_report_to_developer"),
          }}
        />
      </span>
    </div>
  );
};
