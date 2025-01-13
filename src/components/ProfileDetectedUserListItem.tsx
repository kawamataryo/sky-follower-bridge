import React from "react";
import type { BskyUser } from "~types";
import UserCard from "./UserCard";

export type Props = {
  user: Omit<
    BskyUser,
    | "originalAvatar"
    | "originalHandle"
    | "originalDisplayName"
    | "originalProfileLink"
  >;
  clickAction: (
    user: Omit<
      BskyUser,
      | "originalAvatar"
      | "originalHandle"
      | "originalDisplayName"
      | "originalProfileLink"
    >,
  ) => Promise<void>;
};

export const ProfileDetectedUserListItem = ({ user, clickAction }: Props) => {
  const [isBtnHovered, setIsBtnHovered] = React.useState(false);
  const [isJustClicked, setIsJustClicked] = React.useState(false);
  const actionBtnLabelAndClass = React.useMemo(() => {
    const follow = {
      label: chrome.i18n.getMessage("button_follow_on_bluesky"),
      class: "btn-primary",
    };
    const following = {
      label: chrome.i18n.getMessage("button_following_on_bluesky"),
      class:
        "btn-outline hover:bg-transparent hover:border hover:bg-transparent hover:text-base-content",
    };
    const unfollow = {
      label: chrome.i18n.getMessage("button_unfollow_on_bluesky"),
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
  }, [user.isFollowing, isBtnHovered, isJustClicked]);

  const [isLoading, setIsLoading] = React.useState(false);

  const handleActionButtonClick = async () => {
    setIsLoading(true);
    await clickAction(user);
    setIsLoading(false);
    setIsJustClicked(true);
  };

  return (
    <UserCard
      user={user}
      loading={isLoading}
      actionBtnLabelAndClass={actionBtnLabelAndClass}
      handleActionButtonClick={handleActionButtonClick}
      setIsBtnHovered={setIsBtnHovered}
      setIsJustClicked={setIsJustClicked}
      hasReSearchButton={false}
      hasDeleteButton={false}
    />
  );
};
