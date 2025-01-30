import React from "react";

type UserInfoProps = {
  handle: string;
  displayName: string;
  url?: string;
};

export const UserInfo = ({ handle, displayName, url }: UserInfoProps) => (
  <div>
    <h2 className="card-title break-word text-[1.1rem] font-bold">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          {displayName}
        </a>
      ) : (
        <>{displayName}</>
      )}
    </h2>
    <p className="w-fit break-word text-gray-500 dark:text-gray-400 text-sm">
      <a href={url} target="_blank" rel="noreferrer" className="break-word">
        @{handle}
      </a>
    </p>
  </div>
);

export default UserInfo;
