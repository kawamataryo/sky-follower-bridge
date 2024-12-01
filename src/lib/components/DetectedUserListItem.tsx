import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import React from "react";
import { match } from "ts-pattern";
import type { BskyUser } from "~types";
import { ACTION_MODE, MATCH_TYPE_LABEL_AND_COLOR } from "../constants";
import DetectedUserSource from "./DetectedUserSource";
import UserCard from "./UserCard";
export type Props = {
  user: BskyUser;
  actionMode: (typeof ACTION_MODE)[keyof typeof ACTION_MODE];
  clickAction: (user: BskyUser) => Promise<void>;
  reSearch: (user: {
    sourceDid: string;
    accountName: string;
    displayName: string;
  }) => Promise<void>;
};

const DetectedUserListItem = ({
  user,
  actionMode,
  clickAction,
  reSearch,
}: Props) => {
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

  const handleReSearchClick = () => {
    reSearch({
      sourceDid: user.did,
      accountName: user.originalHandle,
      displayName: user.originalDisplayName,
    });
  };

  const matchTypeColor = MATCH_TYPE_LABEL_AND_COLOR[user.matchType].color;

  return (
    <div>
      <div className={`w-full border-l-8 border-${matchTypeColor}`}>
        <div
          className={`w-full border-t border-gray-500 text-${matchTypeColor} grid grid-cols-[22%_1fr]`}
        >
          <div className="px-3 bg-slate-100 dark:bg-slate-800">
            {MATCH_TYPE_LABEL_AND_COLOR[user.matchType].label}
          </div>
          <div className="px-3" />
        </div>
        <div className="bg-base-100 w-full relative grid grid-cols-[22%_1fr] gap-5">
          <DetectedUserSource user={user} />
          <UserCard
            user={user}
            loading={loading}
            actionBtnLabelAndClass={actionBtnLabelAndClass}
            handleActionButtonClick={handleActionButtonClick}
            setIsBtnHovered={setIsBtnHovered}
            setIsJustClicked={setIsJustClicked}
            handleReSearchClick={handleReSearchClick}
          />
        </div>
      </div>
    </div>
  );
};

export default DetectedUserListItem;
