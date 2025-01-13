import type { Meta, StoryObj } from "@storybook/react";

import { BSKY_USER_MATCH_TYPE } from "~lib/constants";
import UserCard, { type UserCardProps } from "./UserCard";

const meta: Meta<typeof UserCard> = {
  title: "Components/UserCard",
  component: UserCard,
};
export default meta;

type Story = StoryObj<{
  items: {
    user: UserCardProps["user"];
  }[];
}>;

const demoUser: UserCardProps["user"] = {
  did: "",
  handle: "kawamataryo.bsky.social",
  displayName: "KawamataRyo",
  description: `
    Frontend engineer @lapras-inc/ TypeScript / Vue.js / Firebase / ex-FireFighter 🔥
    Developer of  Sky Follower Bridge.

    Twitter: twitter.com/KawamataRyo
    GitHub: github.com/kawamataryo
    Zenn: zenn.dev/ryo_kawamata`,
  avatar: "https://i.pravatar.cc/150?u=123",
  matchType: BSKY_USER_MATCH_TYPE.HANDLE,
  isFollowing: false,
  followingUri: "",
  isBlocking: false,
  blockingUri: "",
  originalAvatar: "https://i.pravatar.cc/150?u=123",
  originalHandle: "kawamataryo",
  originalDisplayName: "KawamataRyo",
  originalProfileLink: "https://x.com/kawamataryo",
};
const CardTemplate = {
  render: (args: Story["args"]["items"][0]) => (
    <UserCard
      user={args.user}
      loading={false}
      actionBtnLabelAndClass={{ label: "Follow", class: "btn-primary" }}
      handleActionButtonClick={() => {}}
      setIsBtnHovered={() => {}}
      setIsJustClicked={() => {}}
      handleReSearchClick={() => {}}
      handleDeleteClick={() => {}}
    />
  ),
};

const CardsTemplate: Story = {
  render: (args) => (
    <div className="divide-y divide-gray-400 border-y border-gray-400">
      {args.items.map((arg, i) => (
        <UserCard
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={i}
          user={arg.user}
          loading={false}
          actionBtnLabelAndClass={{ label: "Follow", class: "btn-primary" }}
          handleActionButtonClick={() => {}}
          setIsBtnHovered={() => {}}
          setIsJustClicked={() => {}}
          handleReSearchClick={() => {}}
          handleDeleteClick={() => {}}
        />
      ))}
    </div>
  ),
};

export const Default = {
  ...CardTemplate,
  args: {
    user: {
      ...demoUser,
      matchType: BSKY_USER_MATCH_TYPE.HANDLE,
    },
  },
};
