import React from "react";
import { BskyServiceWorkerClient } from "~lib/bskyServiceWorkerClient";
import {
  ACTION_MODE,
  BSKY_USER_MATCH_TYPE,
  type MESSAGE_NAMES,
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
  const [loading, setLoading] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [autoFollowing, setAutoFollowing] = React.useState(false);
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
    async (user: BskyUser) => {
      if (!bskyClient.current) return;
      let resultUri: string | null = null;

      if (actionMode === ACTION_MODE.FOLLOW && !user.isFollowing) {
        const result = await bskyClient.current.follow(user.did);
        resultUri = result.uri;
        setUsers((prev) =>
          prev.map((prevUser) =>
            prevUser.did === user.did
              ? { ...prevUser, isFollowing: true, followingUri: resultUri }
              : prevUser
          )
        );
      }

      // Keep the block functionality as is
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
    [actionMode]
  );

  const processUser = React.useCallback(
    async (userData: ReturnType<typeof getAccountNameAndDisplayName>) => {
      if (!bskyClient.current) return;

      const searchResult = await searchBskyUser({
        client: bskyClient.current,
        userData,
      });

      if (searchResult) {
        const newUser: BskyUser = {
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
        };

        setUsers((prev) => {
          if (prev.some(u => u.did === newUser.did)) {
            return prev;
          }
          return [newUser, ...prev];
        });
      }
    },
    []
  );

  const loadTwitterFollowing = React.useCallback(
    async (queryParam: string) => {
      setLoading(true);
      let isBottomReached = false;
      let processedUsers = new Set<string>();
      let lastScrollHeight = 0;

      const detectNewUsers = () => {
        const data = detectXUsers(queryParam).filter(
          (u) => !processedUsers.has(u.twAccountName)
        );

        setDetectedXUsers((prev) => [...data, ...prev]);
        data.forEach(u => processedUsers.add(u.twAccountName));

        return data;
      };

      const scrollAndDetect = async () => {
        const newUsers = detectNewUsers();
        if (newUsers.length > 0) {
          // Scroll to bottom
          window.scrollTo(0, document.body.scrollHeight);

          // Wait for new content to load
          await wait(2000);

          const currentScrollHeight = document.body.scrollHeight;
          if (currentScrollHeight > lastScrollHeight) {
            lastScrollHeight = currentScrollHeight;
            await scrollAndDetect();
          } else {
            isBottomReached = true;
          }
        } else {
          isBottomReached = true;
        }
      };

      await scrollAndDetect();
      setLoading(false);
    },
    []
  );

  const searchBlueskyUsers = React.useCallback(async () => {
    setSearching(true);
    for (const userData of detectedXUsers) {
      await processUser(userData);
    }
    setSearching(false);
  }, [detectedXUsers, processUser]);

  const autoFollowUsers = React.useCallback(async () => {
    setAutoFollowing(true);
    for (const user of users) {
      if (!user.isFollowing) {
        await handleClickAction(user);
      }
    }
    setAutoFollowing(false);
  }, [users, handleClickAction]);

  const exportResults = () => {
    const csv = users.map(user => 
      `${user.handle},${user.displayName},${user.did},${user.isFollowing}`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "bluesky_users.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const importResults = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result as string;
      const lines = csv.split('\n');
      const importedUsers: BskyUser[] = lines.map(line => {
        const [handle, displayName, did, isFollowing] = line.split(',');
        return {
          handle,
          displayName,
          did,
          isFollowing: isFollowing === 'true',
          avatar: '', // You might want to handle this differently
          description: '',
          matchType: BSKY_USER_MATCH_TYPE.HANDLE, // Default value, adjust as needed
          followingUri: null,
          isBlocking: false,
          blockingUri: null,
        };
      });
      setUsers(importedUsers);
    };
    reader.readAsText(file);
  };

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
      loadTwitterFollowing(MESSAGE_NAME_TO_QUERY_PARAM_MAP[messageName]).catch(
        (e) => {
          setErrorMessage(e.message);
        },
      );
      showModal();
    },
    [loadTwitterFollowing]
  );

  const restart = React.useCallback(() => {
    loadTwitterFollowing(retrievalParams.messageName).catch((e) => {
      setErrorMessage(e.message);
    });
  }, [retrievalParams, loadTwitterFollowing]);

  const isRateLimitError = React.useMemo(() => {
    // TODO: improve this logic
    return errorMessage.toLowerCase().replace(" ", "").includes("ratelimit");
  }, [errorMessage]);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: todo
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
    searching,
    autoFollowing,
    actionMode,
    errorMessage,
    isRateLimitError,
    restart,
    isSucceeded: !loading && !errorMessage && users.length > 0,
    matchTypeFilter,
    changeMatchTypeFilter,
    filteredUsers,
    loadTwitterFollowing,
    searchBlueskyUsers,
    autoFollowUsers,
    exportResults,
    importResults,
    detectedXUsers,
  };
};
