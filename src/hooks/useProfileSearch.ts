import type { BskyUser, CrawledUserInfo, MatchType } from "~types";
import React from "react";
import { getChromeStorage } from "~lib/chromeHelper";
import { STORAGE_KEYS } from "~lib/constants";
import { BskyServiceWorkerClient } from "~lib/bskyServiceWorkerClient";
import type { AtpSessionData } from "@atproto/api/dist/types";
import { fuzzySearchBskyUser } from "~lib/fuzzySearchBskyUser";

export const useProfileSearch = () => {
  const [bskyUsers, setBskyUsers] = React.useState<Omit<BskyUser, "originalAvatar" | "originalHandle" | "originalDisplayName" | "originalProfileLink">[]>([]);
  const bskyClient = React.useRef<BskyServiceWorkerClient | null>(null);


  const initialize = React.useCallback(async (session: AtpSessionData) => {
    bskyClient.current = new BskyServiceWorkerClient(session);
  }, []);

  const searchUser = async (userData: Omit<CrawledUserInfo, "originalAvatar" | "originalProfileLink">) => {
    setBskyUsers([]);
    if (!bskyClient.current) {
      return;
    }
    const detectedUsers = await fuzzySearchBskyUser({
      client: bskyClient.current,
      userData,
    });
    console.log("detectedUsers", detectedUsers);
    for (const detectedUser of detectedUsers) {
      setBskyUsers((prev) => {
        if (prev.some((u) => u.did === detectedUser.did)) {
          return prev;
        }
        return [
          ...prev,
          {
            did: detectedUser.did,
            avatar: detectedUser.avatar,
            displayName: detectedUser.displayName,
            handle: detectedUser.handle,
            description: detectedUser.description,
            matchType: detectedUser.matchType as MatchType,
            isFollowing: !!detectedUser.viewer?.following,
            followingUri: detectedUser.viewer?.following,
            isBlocking: !!detectedUser.viewer?.blocking,
            blockingUri: detectedUser.viewer?.blocking,
          },
        ];
      });
    }
  };

  return {
    bskyUsers,
    searchUser,
    initialize,
  };
};
