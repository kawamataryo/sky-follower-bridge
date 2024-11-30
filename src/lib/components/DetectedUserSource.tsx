import React from "react";
import type { BskyUser } from "~types";
import { MATCH_TYPE_LABEL_AND_COLOR } from "../constants";
import { UserInfo, UserProfile } from "./UserCard";

type DetectedUserSourceProps = {
  user: BskyUser;
};

const DetectedUserSource = ({ user }: DetectedUserSourceProps) => (
  <div className="flex flex-row gap-2 bg-slate-100 dark:bg-slate-800 justify-between pr-2">
    <div
      className={`border-l-8 border-${
        MATCH_TYPE_LABEL_AND_COLOR[user.matchType].color
      } relative py-3 pl-4 pr-1 grid grid-cols-[50px_1fr]`}
    >
      <UserProfile
        avatar={user.originalAvatar}
        url={user.originalProfileLink}
      />
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center gap-2">
          <UserInfo
            handle={user.originalHandle}
            displayName={user.originalDisplayName}
            url={user.originalProfileLink}
          />
        </div>
      </div>
    </div>
    <div className="flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m8.25 4.5 7.5 7.5-7.5 7.5"
        />
      </svg>
    </div>
  </div>
);

export default DetectedUserSource;
