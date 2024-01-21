import type { Meta, StoryObj } from "@storybook/react";

import UserCardSkeleton from "./UserCardSkeleton";

const meta: Meta<typeof UserCardSkeleton> = {
  title: "CSUI/UserCardSkeleton",
  component: UserCardSkeleton,
};
export default meta;

type Story = StoryObj<typeof UserCardSkeleton>;

export const Default: Story = {};
