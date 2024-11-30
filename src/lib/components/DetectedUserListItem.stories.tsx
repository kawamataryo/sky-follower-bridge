import type { Meta, StoryObj } from "@storybook/react";

import { ACTION_MODE, BSKY_USER_MATCH_TYPE } from "../constants";
import DetectedUserListItem, { type Props } from "./DetectedUserListItem";

const meta: Meta<typeof DetectedUserListItem> = {
  title: "Components/DetectedUserListItem",
  component: DetectedUserListItem,
};
export default meta;

type Story = StoryObj<{
  items: {
    user: Props["user"];
    action: Props["clickAction"];
  }[];
}>;

const demoUser: Props["user"] = {
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

const mockAction: Props["clickAction"] = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

const CardTemplate = {
  render: (args: Story["args"]["items"][0]) => (
    <DetectedUserListItem
      user={args.user}
      clickAction={args.action}
      actionMode={ACTION_MODE.FOLLOW}
    />
  ),
};

const CardsTemplate: Story = {
  render: (args) => (
    <div className="divide-y divide-gray-400 border-y border-gray-400">
      {args.items.map((arg, i) => (
        <DetectedUserListItem
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={i}
          user={arg.user}
          clickAction={arg.action}
          actionMode={ACTION_MODE.FOLLOW}
        />
      ))}
    </div>
  ),
};

export const Default = {
  ...CardTemplate,
  args: {
    action: mockAction,
    user: {
      ...demoUser,
      matchType: BSKY_USER_MATCH_TYPE.HANDLE,
    },
  },
};

export const Cards = {
  ...CardsTemplate,
  args: {
    items: [
      {
        action: mockAction,
        user: {
          ...demoUser,
          matchType: BSKY_USER_MATCH_TYPE.HANDLE,
          isFollowing: true,
        },
      },
      {
        action: mockAction,
        user: {
          ...demoUser,
          matchType: BSKY_USER_MATCH_TYPE.DESCRIPTION,
        },
      },
      {
        action: mockAction,
        user: {
          ...demoUser,
          matchType: BSKY_USER_MATCH_TYPE.DISPLAY_NAME,
          inFollowing: true,
        },
      },
    ],
  },
};
