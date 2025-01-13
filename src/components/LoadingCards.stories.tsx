import type { Meta, StoryObj } from "@storybook/react";
import LoadingCards from "./LoadingCards";

const meta = {
  title: "Components/LoadingCards",
  component: LoadingCards,
  tags: ["autodocs"],
} satisfies Meta<typeof LoadingCards>;

export default meta;
type Story = StoryObj<typeof LoadingCards>;

export const Default: Story = {
  args: {},
};
