import type { Meta, StoryObj } from "@storybook/react";

import AlertError from "./AlertError";

const meta: Meta<typeof AlertError> = {
  title: "Components/AlertError",
  component: AlertError,
};
export default meta;

type Story = StoryObj<typeof AlertError>;

export const Default: Story = {
  args: {
    children: "Error!",
  },
};

export const WithRestartButton: Story = {
  args: {
    children: "Rate limit Error!",
    retryAction: () => {
      alert("restart!");
    },
  },
};
