import React from "react";
import { match } from "ts-pattern";
import { ACTION_MODE, MATCH_TYPE_LABEL_AND_COLOR } from "../constants";
import AvatarFallbackSvg from "./Icons/AvatarFallbackSvg";
import type { BskyUser } from "~types";

export type Props = {
  user: BskyUser;
  actionMode: (typeof ACTION_MODE)[keyof typeof ACTION_MODE];
  clickAction: (user: BskyUser) => Promise<void>;
};

const UserCard = ({ user, actionMode, clickAction }: Props) => {
  const [isBtnHovered, setIsBtnHovered] = React.useState(false);
  const [isJustClicked, setIsJustClicked] = React.useState(false);
  const actionBtnLabelAndClass = React.useMemo(
    () =>
      match(actionMode)
        .with(ACTION_MODE.FOLLOW, () => {
          const follow = {
            label: "Follow on Bluesky",
            class: "btn-primary",
          };
          const following = {
            label: "Following on Bluesky",
            class:
              "btn-outline hover:bg-transparent hover:border hover:bg-transparent hover:text-base-content",
          };
          const unfollow = {
            label: "Unfollow on Bluesky",
            class:
              "text-red-500 hover:bg-transparent hover:border hover:border-red-500",
          };
          if (!isBtnHovered) {
            return user.isFollowing ? following : follow;
          }
          if (user.isFollowing) {
            return isJustClicked ? following : unfollow;
          }
          return follow;
        })
        .with(ACTION_MODE.BLOCK, () => {
          const block = {
            label: "block on Bluesky",
            class: "btn-primary",
          };
          const blocking = {
            label: "Blocking on Bluesky",
            class:
              "btn-outline hover:bg-transparent hover:border hover:bg-transparent hover:text-base-content",
          };
          const unblock = {
            label: "Unblock on Bluesky",
            class:
              "text-red-500 hover:bg-transparent hover:border hover:border-red-500",
          };
          if (!isBtnHovered) {
            return user.isBlocking ? blocking : block;
          }
          if (user.isBlocking) {
            return isJustClicked ? blocking : unblock;
          }
          return block;
        })
        .run(),
    [
      user.isFollowing,
      user.isBlocking,
      actionMode,
      isBtnHovered,
      isJustClicked,
    ],
  );

  const [loading, setLoading] = React.useState(false);

  const handleActionButtonClick = async () => {
    setLoading(true);
    await clickAction(user);
    setLoading(false);
    setIsJustClicked(true);
  };

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
              <button
                type="button"
                className={`btn btn-sm rounded-3xl ${
                  loading ? "" : actionBtnLabelAndClass.class
                }`}
                onClick={handleActionButtonClick}
                onMouseEnter={() => setIsBtnHovered(true)}
                onMouseLeave={() => {
                  setIsBtnHovered(false);
                  setIsJustClicked(false);
                }}
                disabled={loading}
              >
                {loading ? "Processing..." : actionBtnLabelAndClass.label}
              </button>
            </div>
          </div>
          <p className="text-sm break-all">{user.description}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
