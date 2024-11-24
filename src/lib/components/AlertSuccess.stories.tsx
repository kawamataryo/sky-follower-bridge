import type { Meta, StoryObj } from "@storybook/react";

import AlertSuccess from "./AlertSuccess";

const meta: Meta<typeof AlertSuccess> = {
  title: "Components/AlertSuccess",
  component: AlertSuccess,
};
export default meta;

type Story = StoryObj<typeof AlertSuccess>;

export const Default: Story = {
  args: {
    children: "Success!",
  },
};
