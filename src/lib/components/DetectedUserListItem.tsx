import React from "react";
import { match } from "ts-pattern";
import type { BskyUser } from "~types";
import { ACTION_MODE } from "../constants";
import DetectedUserSource from "./DetectedUserSource";
import UserCard from "./UserCard";
export type Props = {
  user: BskyUser;
  actionMode: (typeof ACTION_MODE)[keyof typeof ACTION_MODE];
  clickAction: (user: BskyUser) => Promise<void>;
};

const DetectedUserListItem = ({ user, actionMode, clickAction }: Props) => {
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
      <DetectedUserSource user={user} />
      <UserCard
        user={user}
        loading={loading}
        actionBtnLabelAndClass={actionBtnLabelAndClass}
        handleActionButtonClick={handleActionButtonClick}
        setIsBtnHovered={setIsBtnHovered}
        setIsJustClicked={setIsJustClicked}
      />
    </div>
  );
};

export default DetectedUserListItem;
