import type {
  BSKY_USER_MATCH_TYPE,
  MESSAGE_NAMES,
  SERVICE_TYPE,
} from "~lib/constants";

export type MatchType =
  (typeof BSKY_USER_MATCH_TYPE)[keyof typeof BSKY_USER_MATCH_TYPE];

export type MessageName = (typeof MESSAGE_NAMES)[keyof typeof MESSAGE_NAMES];

export type BskyUser = {
  did: string;
  avatar: string;
  displayName: string;
  handle: string;
  description: string;
  matchType: MatchType;
  isFollowing: boolean;
  followingUri: string | null;
  isBlocking: boolean;
  blockingUri: string | null;
  originalAvatar: string;
  originalHandle: string;
  originalDisplayName: string;
  originalProfileLink: string;
};

export type MatchTypeFilterValue = {
  [BSKY_USER_MATCH_TYPE.DESCRIPTION]: boolean;
  [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: boolean;
  [BSKY_USER_MATCH_TYPE.HANDLE]: boolean;
  [BSKY_USER_MATCH_TYPE.FOLLOWING]: boolean;
};

export type CrawledUserInfo = {
  accountName: string;
  displayName: string;
  accountNameRemoveUnderscore: string;
  accountNameReplaceUnderscore: string;
  bskyHandle: string;
  originalAvatar: string;
  originalProfileLink: string;
};

export type ServiceType = (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE];

export interface IService {
  messageName: MessageName;
  crawledUsers: Set<string>;

  isTargetPage(): [boolean, string];

  processExtractedData(user: CrawledUserInfo): Promise<CrawledUserInfo>;

  extractUserData(userCell: Element): CrawledUserInfo;

  getCrawledUsers(): CrawledUserInfo[];

  getScrollTarget(): HTMLElement | null;

  scrollToBottom(): void;

  checkEnd(): boolean;
}
