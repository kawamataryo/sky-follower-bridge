import type { Meta, StoryObj } from "@storybook/react";
import AsyncButton from "./AsyncButton";

const meta = {
  title: "Components/AsyncButton",
  component: AsyncButton,
} as Meta<typeof AsyncButton>;

export default meta;

type Story = StoryObj<typeof AsyncButton>;

export const Default: Story = {
  args: {
    label: "Click Me",
    onClick: async () => {
      return new Promise((resolve) => setTimeout(resolve, 2000));
    },
  },
};
