import type { Meta, StoryObj } from "@storybook/react";

import { BSKY_USER_MATCH_TYPE } from "../constants";
import MatchTypeFilter from "./MatchTypeFilter";

const meta: Meta<typeof MatchTypeFilter> = {
  title: "CSUI/MatchTypeFilter",
  component: MatchTypeFilter,
};
export default meta;

type Story = StoryObj<typeof MatchTypeFilter>;

export const Default: Story = {
  args: {
    value: {
      [BSKY_USER_MATCH_TYPE.HANDLE]: true,
      [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: false,
      [BSKY_USER_MATCH_TYPE.DESCRIPTION]: true,
    },
    onChange: () => {},
  },
};
