import React from "react";
import type { BskyUser } from "~types";
import AvatarFallbackSvg from "./Icons/AvatarFallbackSvg";

type UserProfileProps = {
  avatar: string;
  url: string;
};

export const UserProfile = ({ avatar, url }: UserProfileProps) => (
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

export const UserInfo = ({ handle, displayName, url }: UserInfoProps) => (
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

export const ActionButton = ({
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
export type UserCardProps = {
  user: BskyUser;
  loading: boolean;
  actionBtnLabelAndClass: { label: string; class: string };
  handleActionButtonClick: () => void;
  setIsBtnHovered: (value: boolean) => void;
  setIsJustClicked: (value: boolean) => void;
};

const UserCard = ({
  user,
  loading,
  actionBtnLabelAndClass,
  handleActionButtonClick,
  setIsBtnHovered,
  setIsJustClicked,
}: UserCardProps) => (
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
);

export default UserCard;
