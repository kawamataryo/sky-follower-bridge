export type MatchType = "handle" | "display_name" | "description" | "none";

export type CrawledUserInfo = {
  accountName: string;
  displayName: string;
  accountNameRemoveUnderscore: string;
  accountNameReplaceUnderscore: string;
  bskyHandleInDescription: string;
  originalAvatar: string;
  originalProfileLink: string;
};

export type BskyUser = {
  did: string;
  avatar: string;
  displayName: string;
  handle: string;
  description: string;
  matchType: MatchType;
  isFollowing: boolean;
  followingUri: string | null;
  originalAvatar: string;
  originalHandle: string;
  originalDisplayName: string;
  originalProfileLink: string;
};

export type ScanStatus =
  | "idle"
  | "logging_in"
  | "scanning"
  | "completed"
  | "error";

export type WebViewMessage =
  | { type: "users"; payload: CrawledUserInfo[] }
  | { type: "scroll_end" }
  | { type: "login_detected"; url: string }
  | { type: "error"; message: string };

export type SessionData =
  | { authMethod: "oauth"; sub: string }
  | { authMethod: "app-password"; service: string; session: string };
