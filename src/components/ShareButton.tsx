import BlueskyIconSvg from "./Icons/BlueskyIconSvg";

type Props = {
  shareText: string;
};

export const ShareButton = ({ shareText }: Props) => {
  return (
    <div className="share-button-wrapper inline-block">
      <a
        className="btn btn-sm btn-wide share-button"
        href={`https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <BlueskyIconSvg className="w-5 h-5" />
        {chrome.i18n.getMessage("share_on_bluesky")}
      </a>
    </div>
  );
};
