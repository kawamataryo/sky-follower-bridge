import type { Meta, StoryObj } from "@storybook/react";
import { BSKY_USER_MATCH_TYPE } from "../constants";
import Sidebar from "./Sidebar";

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    detectedCount: 42,
    filterValue: {
      [BSKY_USER_MATCH_TYPE.HANDLE]: true,
      [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: false,
      [BSKY_USER_MATCH_TYPE.DESCRIPTION]: true,
      [BSKY_USER_MATCH_TYPE.FOLLOWING]: true,
    },
    onChangeFilter: (key) => {
      console.log(`Filter changed: ${key}`);
    },
  },
};

export const NoDetections: Story = {
  args: {
    detectedCount: 0,
    filterValue: {
      [BSKY_USER_MATCH_TYPE.HANDLE]: false,
      [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: false,
      [BSKY_USER_MATCH_TYPE.DESCRIPTION]: false,
      [BSKY_USER_MATCH_TYPE.FOLLOWING]: false,
    },
    onChangeFilter: (key) => {
      console.log(`Filter changed: ${key}`);
    },
  },
};
