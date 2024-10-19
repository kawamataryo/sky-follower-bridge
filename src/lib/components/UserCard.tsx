import React from "react";
import { ACTION_MODE, MATCH_TYPE_LABEL_AND_COLOR } from "../constants";
import type { BskyUser } from "../hooks/useRetrieveBskyUsers";
import AvatarFallbackSvg from "./Icons/AvatarFallbackSvg";

export type Props = {
  user: BskyUser;
  actionMode: (typeof ACTION_MODE)[keyof typeof ACTION_MODE];
};

const UserCard: React.FC<Props> = ({ user, actionMode }) => {
  return (
    <div className="bg-base-100 w-full relative">
      <div
        className={`border-l-8 border-${
          MATCH_TYPE_LABEL_AND_COLOR[user.matchType].color
        } card-body relative py-3 px-4 rounded-sm grid grid-cols-[70px_1fr]`}
      >
        <div>
          <div className="avatar">
            <div className="w-14 rounded-full  border border-white ">
              <a
                href={`https://bsky.app/profile/${user.handle}`}
                target="_blank"
                rel="noreferrer"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="" />
                ) : (
                  <AvatarFallbackSvg />
                )}
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-2">
            <div>
              <h2 className="card-title break-all">
                <a
                  href={`https://bsky.app/profile/${user.handle}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {user.displayName}
                </a>
              </h2>
              <p className="whitespace-nowrap w-fit break-all text-gray-500 dark:text-gray-400 text-sm">
                <a
                  href={`https://bsky.app/profile/${user.handle}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{user.handle}
                </a>
              </p>
            </div>
            <div className="card-actions">
              <span className={`badge ${user.isFollowing ? 'badge-primary' : 'badge-outline'}`}>
                {user.isFollowing ? 'Following' : 'Not Following'}
              </span>
            </div>
          </div>
          <p className="text-sm break-all">{user.description}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
