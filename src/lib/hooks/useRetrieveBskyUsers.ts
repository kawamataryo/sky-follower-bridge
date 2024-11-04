import type { AtpSessionData } from "@atproto/api";
import React from "react";
import { BskyServiceWorkerClient } from "~lib/bskyServiceWorkerClient";
import {
  type MESSAGE_NAMES,
  MESSAGE_NAME_TO_QUERY_PARAM_MAP,
  STORAGE_KEYS,
} from "~lib/constants";
import { getAccountNameAndDisplayName, getUserCells } from "~lib/domHelpers";
import { searchBskyUser } from "~lib/searchBskyUsers";
import { wait } from "~lib/utils";
import type { MatchType } from "~types";

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
  const [detectedXUsers, setDetectedXUsers] = React.useState<
    ReturnType<typeof detectXUsers>
  >([]);
  const [users, setUsers] = React.useState<BskyUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isBottomReached, setIsBottomReached] = React.useState(false);

  const [retrievalParams, setRetrievalParams] = React.useState<null | {
    session: AtpSessionData;
    messageName: (typeof MESSAGE_NAMES)[keyof typeof MESSAGE_NAMES];
  }>(null);

  const modalRef = React.useRef<HTMLDialogElement>(null);
  const showModal = () => {
    modalRef.current?.showModal();
  };

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

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const startRetrieveLoop = React.useCallback(
    async (queryParam: string) => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      let index = 0;

      while (!isBottomReached) {
        if (signal.aborted) {
          break;
        }

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
          setIsBottomReached(true);
          setLoading(false);
        }

        index++;
        if (process.env.NODE_ENV === "development" && index > 5) {
          setLoading(false);
          break;
        }
      }
    },
    [retrieveBskyUsers, detectedXUsers, isBottomReached],
  );

  React.useEffect(() => {
    chrome.storage.local.set({ users: JSON.stringify(users) });
  }, [users]);

  const stopRetrieveLoop = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const initialize = React.useCallback(async () => {
    const storage = await chrome.storage.local.get([
      STORAGE_KEYS.BSKY_CLIENT_SESSION,
      STORAGE_KEYS.BSKY_MESSAGE_NAME,
    ]);
    const messageName = storage[STORAGE_KEYS.BSKY_MESSAGE_NAME];
    const session = storage[STORAGE_KEYS.BSKY_CLIENT_SESSION];

    setRetrievalParams({
      session,
      messageName,
    });

    bskyClient.current = new BskyServiceWorkerClient(session);

    startRetrieveLoop(MESSAGE_NAME_TO_QUERY_PARAM_MAP[messageName]).catch(
      (e) => {
        console.error(e);
        setErrorMessage(e.message);
        setLoading(false);
      },
    );
    setLoading(true);
    showModal();
  }, []);

  const restart = React.useCallback(() => {
    startRetrieveLoop(
      MESSAGE_NAME_TO_QUERY_PARAM_MAP[retrievalParams.messageName],
    ).catch((e) => {
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

  return {
    modalRef,
    showModal,
    initialize,
    users,
    loading,
    errorMessage,
    isRateLimitError,
    restart,
    isSucceeded,
    isBottomReached,
    stopRetrieveLoop,
  };
};
