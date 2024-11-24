import type { Meta, StoryObj } from "@storybook/react";
import SocialLinks from "./SocialLinks";

const meta = {
  title: "Components/SocialLinks",
  component: SocialLinks,
} as Meta<typeof SocialLinks>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
