import type {
  BSKY_USER_MATCH_TYPE,
  FILTER_TYPE,
  MESSAGE_NAMES,
  SERVICE_TYPE,
} from "~lib/constants";

export type MatchType =
  (typeof BSKY_USER_MATCH_TYPE)[keyof typeof BSKY_USER_MATCH_TYPE];

export type FilterType = (typeof FILTER_TYPE)[keyof typeof FILTER_TYPE];

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
  avatarSimilarityScore: number;
};

export type FilterValue = {
  [FILTER_TYPE.AVATAR_NOT_SIMILAR]: boolean;
  [FILTER_TYPE.DESCRIPTION]: boolean;
  [FILTER_TYPE.DISPLAY_NAME]: boolean;
  [FILTER_TYPE.HANDLE]: boolean;
  [FILTER_TYPE.FOLLOWING]: boolean;
};

export type CrawledUserInfo = {
  accountName: string;
  displayName: string;
  accountNameRemoveUnderscore: string;
  accountNameReplaceUnderscore: string;
  bskyHandleInDescription: string;
  originalAvatar: string;
  originalAvatarDataUrl: string;
  originalProfileLink: string;
};

export type ServiceType = (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE];

export interface IService {
  messageName: MessageName;
  crawledUserCells: Set<HTMLElement>;

  isTargetPage(): [boolean, string];

  processExtractedData(user: CrawledUserInfo): Promise<CrawledUserInfo>;

  extractUserData(userCell: Element): CrawledUserInfo;

  getCrawledUsers(): CrawledUserInfo[];

  getScrollTarget(): HTMLElement | null;

  scrollToBottom(): void;

  checkEnd(): boolean;
}
