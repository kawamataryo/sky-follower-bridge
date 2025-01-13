import type { AtpSessionData } from "@atproto/api/dist/types";
import React from "react";
import { BskyServiceWorkerClient } from "~lib/bskyServiceWorkerClient";
import { getChromeStorage } from "~lib/chromeHelper";
import { STORAGE_KEYS } from "~lib/constants";
import { fuzzySearchBskyUser } from "~lib/fuzzySearchBskyUser";
import type { BskyUser, CrawledUserInfo, MatchType } from "~types";

export const useProfileSearch = () => {
  const [bskyUsers, setBskyUsers] = React.useState<
    Omit<
      BskyUser,
      | "originalAvatar"
      | "originalHandle"
      | "originalDisplayName"
      | "originalProfileLink"
    >[]
  >([]);
  const bskyClient = React.useRef<BskyServiceWorkerClient | null>(null);

  const initialize = React.useCallback(async (session: AtpSessionData) => {
    bskyClient.current = new BskyServiceWorkerClient(session);
  }, []);

  const searchUser = React.useCallback(
    async (
      userData: Omit<CrawledUserInfo, "originalAvatar" | "originalProfileLink">,
    ) => {
      setBskyUsers([]);
      if (!bskyClient.current) {
        return;
      }
      const detectedUsers = await fuzzySearchBskyUser({
        client: bskyClient.current,
        userData,
      });
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
    },
    [],
  );

  const handleClickAction = React.useCallback(
    async (
      user: Omit<
        BskyUser,
        | "originalAvatar"
        | "originalHandle"
        | "originalDisplayName"
        | "originalProfileLink"
      >,
    ) => {
      if (!bskyClient.current) return;
      let resultUri: string | null = null;

      // follow
      if (user.isFollowing) {
        await bskyClient.current.unfollow(user.followingUri);
      } else {
        const result = await bskyClient.current.follow(user.did);
        resultUri = result.uri;
      }
      setBskyUsers((prev) =>
        prev.map((prevUser) => {
          if (prevUser.did === user.did) {
            return {
              ...prevUser,
              isFollowing: !prevUser.isFollowing,
              followingUri: resultUri ?? prevUser.followingUri,
            };
          }
          return prevUser;
        }),
      );
    },
    [],
  );

  return {
    bskyUsers,
    searchUser,
    initialize,
    handleClickAction,
  };
};
