import React from "react";
import { BskyServiceWorkerClient } from "~lib/bskyServiceWorkerClient";
import {
  ACTION_MODE,
  BSKY_USER_MATCH_TYPE,
  MESSAGE_NAMES,
  MESSAGE_NAME_TO_ACTION_MODE_MAP,
  MESSAGE_NAME_TO_QUERY_PARAM_MAP,
} from "~lib/constants";
import { getAccountNameAndDisplayName, getUserCells } from "~lib/domHelpers";
import { searchBskyUser } from "~lib/searchBskyUsers";
import { wait } from "~lib/utils";

export type MatchType =
  (typeof BSKY_USER_MATCH_TYPE)[keyof typeof BSKY_USER_MATCH_TYPE];

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
};

const detectXUsers = (userCellQueryParam: string) => {
  const userCells = getUserCells({
    queryParam: userCellQueryParam,
    filterInsertedElement: true,
  });
  return userCells.map((userCell) => {
    return getAccountNameAndDisplayName(userCell);
  });
};

export const useRetrieveBskyUsers = () => {
  const bskyClient = React.useRef<BskyServiceWorkerClient | null>(null);
  const [actionMode, setActionMode] = React.useState<
    (typeof ACTION_MODE)[keyof typeof ACTION_MODE]
  >(ACTION_MODE.FOLLOW);
  const [detectedXUsers, setDetectedXUsers] = React.useState<
    ReturnType<typeof detectXUsers>
  >([]);
  const [users, setUsers] = React.useState<BskyUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [matchTypeFilter, setMatchTypeFilter] = React.useState({
    [BSKY_USER_MATCH_TYPE.HANDLE]: true,
    [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: true,
    [BSKY_USER_MATCH_TYPE.DESCRIPTION]: true,
  });

  const [retrievalParams, setRetrievalParams] = React.useState<null | {
    identifier: string;
    password: string;
    messageName: (typeof MESSAGE_NAMES)[keyof typeof MESSAGE_NAMES];
  }>(null);

  const modalRef = React.useRef<HTMLDialogElement>(null);
  const showModal = () => {
    modalRef.current?.showModal();
  };

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
        setUsers((prev) =>
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
        setUsers((prev) =>
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
    [actionMode],
  );

  const retrieveBskyUsers = React.useCallback(
    async (usersData: ReturnType<typeof getAccountNameAndDisplayName>[]) => {
      for (const userData of usersData) {
        const searchResult = await searchBskyUser({
          client: bskyClient.current,
          userData,
        });
        if (searchResult) {
          setUsers((prev) => {
            if (prev.some((u) => u.did === searchResult.bskyProfile.did)) {
              return prev;
            }
            return [
              ...prev,
              {
                did: searchResult.bskyProfile.did,
                avatar: searchResult.bskyProfile.avatar,
                displayName: searchResult.bskyProfile.displayName,
                handle: searchResult.bskyProfile.handle,
                description: searchResult.bskyProfile.description,
                matchType: searchResult.matchType,
                isFollowing: !!searchResult.bskyProfile.viewer?.following,
                followingUri: searchResult.bskyProfile.viewer?.following,
                isBlocking: !!searchResult.bskyProfile.viewer?.blocking,
                blockingUri: searchResult.bskyProfile.viewer?.blocking,
              },
            ];
          });
        }
      }
    },
    [],
  );

  const startRetrieveLoop = React.useCallback(
    async (queryParam: string) => {
      let isBottomReached = false;
      let index = 0;

      while (!isBottomReached) {
        const data = detectXUsers(queryParam).filter((u) => {
          return !detectedXUsers.some(
            (t) => t.twAccountName === u.twAccountName,
          );
        });
        setDetectedXUsers((prev) => [...prev, ...data]);
        await retrieveBskyUsers(data);

        // scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);

        // wait for fetching data by x
        await wait(3000);

        // break if bottom is reached
        const documentElement = document.documentElement;
        if (
          documentElement.scrollTop + documentElement.clientHeight >=
          documentElement.scrollHeight
        ) {
          isBottomReached = true;
          setLoading(false);
        }

        index++;
        if (process.env.NODE_ENV === "development" && index > 5) {
          setLoading(false);
          break;
        }
      }
    },
    [retrieveBskyUsers, detectedXUsers],
  );

  const initialize = React.useCallback(
    async ({
      identifier,
      password,
      messageName,
    }: {
      identifier: string;
      password: string;
      messageName: (typeof MESSAGE_NAMES)[keyof typeof MESSAGE_NAMES];
    }) => {
      setRetrievalParams({
        identifier,
        password,
        messageName,
      });

      bskyClient.current = await BskyServiceWorkerClient.createAgent({
        identifier,
        password,
      });

      setActionMode(MESSAGE_NAME_TO_ACTION_MODE_MAP[messageName]);
      startRetrieveLoop(MESSAGE_NAME_TO_QUERY_PARAM_MAP[messageName]).catch(
        (e) => {
          setErrorMessage(e.message);
          setLoading(false);
        },
      );
      setLoading(true);
      showModal();
    },
    [startRetrieveLoop, showModal],
  );

  const restart = React.useCallback(() => {
    startRetrieveLoop(retrievalParams.messageName).catch((e) => {
      setErrorMessage(e.message);
      setLoading(false);
    });
    setLoading(true);
  }, [retrievalParams, startRetrieveLoop]);

  const isRateLimitError = React.useMemo(() => {
    // TODO: improve this logic
    return errorMessage.toLowerCase().replace(" ", "").includes("ratelimit");
  }, [errorMessage]);

  const isSucceeded = React.useMemo(
    () => !loading && !errorMessage && users.length > 0,
    [loading, errorMessage, users.length],
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      return matchTypeFilter[user.matchType];
    });
  }, [users, matchTypeFilter]);

  return {
    modalRef,
    showModal,
    initialize,
    handleClickAction,
    users,
    loading,
    actionMode,
    errorMessage,
    isRateLimitError,
    restart,
    isSucceeded,
    matchTypeFilter,
    changeMatchTypeFilter,
    filteredUsers,
  };
};
