import React from "react";
import { match } from "ts-pattern";
import type { BskyUser } from "~types";
import { ACTION_MODE, MATCH_TYPE_LABEL_AND_COLOR } from "../constants";
import AvatarFallbackSvg from "./Icons/AvatarFallbackSvg";

type UserProfileProps = {
  avatar: string;
  url: string;
};

const UserProfile = ({ avatar, url }: UserProfileProps) => (
  <div className="avatar">
    <div className="w-10 h-10 rounded-full border border-white">
      <a href={url} target="_blank" rel="noreferrer">
        {avatar ? <img src={avatar} alt="" /> : <AvatarFallbackSvg />}
      </a>
    </div>
  </div>
);

type UserInfoProps = {
  handle: string;
  displayName: string;
  url: string;
};

const UserInfo = ({ handle, displayName, url }: UserInfoProps) => (
  <div>
    <h2 className="card-title break-all text-[1.1rem] font-bold">
      <a href={url} target="_blank" rel="noreferrer">
        {displayName}
      </a>
    </h2>
    <p className="w-fit break-all text-gray-500 dark:text-gray-400 text-sm">
      <a href={url} target="_blank" rel="noreferrer" className="break-all">
        @{handle}
      </a>
    </p>
  </div>
);

type ActionButtonProps = {
  loading: boolean;
  actionBtnLabelAndClass: { label: string; class: string };
  handleActionButtonClick: () => void;
  setIsBtnHovered: (value: boolean) => void;
  setIsJustClicked: (value: boolean) => void;
};

const ActionButton = ({
  loading,
  actionBtnLabelAndClass,
  handleActionButtonClick,
  setIsBtnHovered,
  setIsJustClicked,
}: ActionButtonProps) => (
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
);

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
        .with(ACTION_MODE.FOLLOW, ACTION_MODE.IMPORT_LIST, () => {
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
            label: "Block on Bluesky",
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
    <div className="bg-base-100 w-full relative grid grid-cols-[22%_1fr] gap-5">
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
      <div className="relative py-3 pl-0 pr-2 grid grid-cols-[50px_1fr]">
        <UserProfile
          avatar={user.avatar}
          url={`https://bsky.app/profile/${user.handle}`}
        />
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-2">
            <UserInfo
              handle={user.handle}
              displayName={user.displayName}
              url={`https://bsky.app/profile/${user.handle}`}
            />
            <div className="card-actions">
              <ActionButton
                loading={loading}
                actionBtnLabelAndClass={actionBtnLabelAndClass}
                handleActionButtonClick={handleActionButtonClick}
                setIsBtnHovered={setIsBtnHovered}
                setIsJustClicked={setIsJustClicked}
              />
            </div>
          </div>
          <p className="text-sm break-all">{user.description}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
