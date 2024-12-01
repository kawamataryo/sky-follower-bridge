import React from "react";
import type { BskyUser } from "~types";
import ActionButton from "./ActionButton";
import UserInfo from "./UserInfo";
import UserProfile from "./UserProfile";

export type UserCardProps = {
  user: Pick<BskyUser, "avatar" | "handle" | "displayName" | "description">;
  loading: boolean;
  actionBtnLabelAndClass: { label: string; class: string };
  handleActionButtonClick: () => void;
  setIsBtnHovered: (value: boolean) => void;
  setIsJustClicked: (value: boolean) => void;
  handleReSearchClick: () => void;
};

const ReSearchButton = ({
  onClick,
}: {
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      className="btn-outline w-7 h-7 border rounded-full flex items-center justify-center"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </button>
  );
};

const UserCard = ({
  user,
  loading,
  actionBtnLabelAndClass,
  handleActionButtonClick,
  setIsBtnHovered,
  setIsJustClicked,
  handleReSearchClick,
}: UserCardProps) => {
  return (
    <div className="relative py-3 pt-1 pl-0 pr-2 grid grid-cols-[50px_1fr]">
      <UserProfile
        avatar={user.avatar}
        url={`https://bsky.app/profile/${user.handle}`}
      />
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-start gap-4">
            <UserInfo
              handle={user.handle}
              displayName={user.displayName}
              url={`https://bsky.app/profile/${user.handle}`}
            />
            <ReSearchButton onClick={handleReSearchClick} />
          </div>
          <div className="card-actions flex items-center gap-4">
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
};

export default UserCard;
