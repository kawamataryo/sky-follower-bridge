import React from "react";
import type { BskyUser } from "~types";
import UserInfo from "./UserInfo";
import UserProfile from "./UserProfile";

export type UserCardWithoutActionButtonProps = {
  user: Pick<BskyUser, "avatar" | "handle" | "displayName" | "description">;
  onClick: () => void;
};

const UserCardWithoutActionButton = ({
  user,
  onClick,
}: UserCardWithoutActionButtonProps) => (
  <button
    type="button"
    className="relative py-3 pl-0 pr-2 grid grid-cols-[50px_1fr] w-full"
    onClick={onClick}
    onKeyUp={onClick}
  >
    <UserProfile avatar={user.avatar} />
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center gap-2">
        <UserInfo handle={user.handle} displayName={user.displayName} />
      </div>
      <p className="text-sm break-all text-left">{user.description}</p>
    </div>
  </button>
);

export default UserCardWithoutActionButton;
