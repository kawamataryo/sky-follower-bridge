import { useStorage } from "@plasmohq/storage/hook";
import { Storage } from "@plasmohq/storage";
import React from "react";
import { BskyServiceWorkerClient } from "~lib/bskyServiceWorkerClient";
import {
  ACTION_MODE,
  BSKY_USER_MATCH_TYPE,
  MESSAGE_NAME_TO_ACTION_MODE_MAP,
  STORAGE_KEYS,
} from "~lib/constants";
import { wait } from "~lib/utils";
import type { BskyUser, MatchType } from "~types";

export const useBskyUserManager = () => {
  const [users, setUsers] = useStorage<BskyUser[]>({
    key: STORAGE_KEYS.DETECTED_BSKY_USERS,
    instance: new Storage({
      area: "local",
    }),
  },
    (v) => (v === undefined ? [] : v)
  );
  const bskyClient = React.useRef<BskyServiceWorkerClient | null>(null);
  const [actionMode, setActionMode] = React.useState<
    (typeof ACTION_MODE)[keyof typeof ACTION_MODE]
  >(ACTION_MODE.FOLLOW);
  const [matchTypeFilter, setMatchTypeFilter] = React.useState({
    [BSKY_USER_MATCH_TYPE.FOLLOWING]: true,
    [BSKY_USER_MATCH_TYPE.HANDLE]: true,
    [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: true,
    [BSKY_USER_MATCH_TYPE.DESCRIPTION]: true,
  });

  const handleClickAction = React.useCallback(
    async (user: (typeof users)[0]) => {
      if (!bskyClient.current) return;
      let resultUri: string | null = null;

      // follow
      if (actionMode === ACTION_MODE.FOLLOW) {
        if (user.isFollowing) {
          await bskyClient.current.unfollow(user.followingUri);
        } else {
          const result = await bskyClient.current.follow(user.did);
          resultUri = result.uri;
        }
        await setUsers((prev) =>
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
      }

      // block
      if (actionMode === ACTION_MODE.BLOCK) {
        if (user.isBlocking) {
          await bskyClient.current.unblock(user.blockingUri);
        } else {
          const result = await bskyClient.current.block(user.did);
          resultUri = result.uri;
        }
        await setUsers((prev) =>
          prev.map((prevUser) => {
            if (prevUser.did === user.did) {
              return {
                ...prevUser,
                isBlocking: !prevUser.isBlocking,
                blockingUri: resultUri ?? prevUser.blockingUri,
              };
            }
            return prevUser;
          }),
        );
      }
    },
    [actionMode, setUsers],
  );

  const changeMatchTypeFilter = React.useCallback(
    (
      matchType: (typeof BSKY_USER_MATCH_TYPE)[keyof typeof BSKY_USER_MATCH_TYPE],
    ) => {
      setMatchTypeFilter((prev) => {
        return {
          ...prev,
          [matchType]: !prev[matchType],
        };
      });
    },
    [],
  );

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      if (
        !matchTypeFilter[BSKY_USER_MATCH_TYPE.FOLLOWING] &&
        user.isFollowing
      ) {
        return false;
      }
      if (
        !matchTypeFilter[BSKY_USER_MATCH_TYPE.FOLLOWING] &&
        actionMode === ACTION_MODE.BLOCK &&
        user.isBlocking
      ) {
        return false;
      }
      return matchTypeFilter[user.matchType];
    });
  }, [users, matchTypeFilter, actionMode]);

  const actionAll = React.useCallback(async () => {
    if (!bskyClient.current) return;
    let actionCount = 0;

    for (const user of filteredUsers) {
      let resultUri: string | null = null;
      // follow
      if (actionMode === ACTION_MODE.FOLLOW) {
        if (user.isFollowing) {
          continue;
        }
        const result = await bskyClient.current.follow(user.did);
        resultUri = result.uri;
        await setUsers((prev) =>
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
        await wait(300);
        actionCount++;
      }

      // block
      if (actionMode === ACTION_MODE.BLOCK) {
        if (user.isBlocking) {
          continue;
        }
        const result = await bskyClient.current.block(user.did);
        resultUri = result.uri;
      }
      await setUsers((prev) =>
        prev.map((prevUser) => {
          if (prevUser.did === user.did) {
            return {
              ...prevUser,
              isBlocking: !prevUser.isBlocking,
              blockingUri: resultUri ?? prevUser.blockingUri,
            };
          }
          return prevUser;
        }),
      );
      await wait(300);
      actionCount++;
    }
    return actionCount;
  }, [filteredUsers, actionMode, setUsers]);

  React.useEffect(() => {
    chrome.storage.local.get(
      [STORAGE_KEYS.BSKY_CLIENT_SESSION, STORAGE_KEYS.BSKY_MESSAGE_NAME],
      (result) => {
        const session = result[STORAGE_KEYS.BSKY_CLIENT_SESSION];
        bskyClient.current = new BskyServiceWorkerClient(session);
        setActionMode(
          MESSAGE_NAME_TO_ACTION_MODE_MAP[
          result[STORAGE_KEYS.BSKY_MESSAGE_NAME]
          ],
        );
      },
    );
  }, []);

  const matchTypeStats = React.useMemo(() => {
    return Object.keys(matchTypeFilter).reduce(
      (acc, key) => {
        if (key === BSKY_USER_MATCH_TYPE.FOLLOWING) {
          return acc;
        }
        const count = users.filter((user) => user.matchType === key).length;
        acc[key] = count;
        return acc;
      },
      {} as Record<MatchType, number>,
    );
  }, [users, matchTypeFilter]);

  return {
    handleClickAction,
    users,
    actionMode,
    matchTypeFilter,
    changeMatchTypeFilter,
    filteredUsers,
    actionAll,
    matchTypeStats,
  };
};
