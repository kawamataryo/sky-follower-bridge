import type { Meta, StoryObj } from "@storybook/react";
import { ACTION_MODE, BSKY_USER_MATCH_TYPE } from "~lib/constants";
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
    detectedCount: 40,
    filterValue: {
      [BSKY_USER_MATCH_TYPE.HANDLE]: true,
      [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: false,
      [BSKY_USER_MATCH_TYPE.DESCRIPTION]: true,
      [BSKY_USER_MATCH_TYPE.FOLLOWING]: true,
    },
    onChangeFilter: (key) => {
      console.log(`Filter changed: ${key}`);
    },
    matchTypeStats: {
      [BSKY_USER_MATCH_TYPE.HANDLE]: 10,
      [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: 10,
      [BSKY_USER_MATCH_TYPE.DESCRIPTION]: 10,
      [BSKY_USER_MATCH_TYPE.FOLLOWING]: 10,
    },
    importList: async () => {
      console.log("importList");
    },
    followAll: async () => {
      console.log("followAll");
    },
    blockAll: async () => {
      console.log("blockAll");
    },
    actionMode: ACTION_MODE.FOLLOW,
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
    matchTypeStats: {
      [BSKY_USER_MATCH_TYPE.HANDLE]: 0,
      [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: 0,
      [BSKY_USER_MATCH_TYPE.DESCRIPTION]: 0,
      [BSKY_USER_MATCH_TYPE.FOLLOWING]: 0,
    },
    importList: async () => {
      console.log("importList");
    },
    followAll: async () => {
      console.log("followAll");
    },
    blockAll: async () => {
      console.log("blockAll");
    },
    actionMode: ACTION_MODE.FOLLOW,
  },
};
