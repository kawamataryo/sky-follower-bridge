import type { AtpSessionData } from "@atproto/api";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import React from "react";
import { match, P } from "ts-pattern";
import { BskyServiceWorkerClient } from "~lib/bskyServiceWorkerClient";
import { MESSAGE_NAMES, STORAGE_KEYS } from "~lib/constants";
import { searchBskyUser } from "~lib/searchBskyUsers";
import type { AbstractService } from "~lib/services/abstractService";
import { XService } from "~lib/services/xService";
import type { BskyUser, CrawledUserInfo, MessageName } from "~types";

const getService = (messageName: string): AbstractService => {
  return match(messageName)
    .with(P.when((name) => [
      MESSAGE_NAMES.SEARCH_BSKY_USER_ON_FOLLOW_PAGE,
      MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE,
      MESSAGE_NAMES.SEARCH_BSKY_USER_ON_BLOCK_PAGE,
    ].includes(name as MessageName)),
      () => new XService(messageName),
    )
    .otherwise(() => new XService(messageName));
};

export const useRetrieveBskyUsers = () => {
  const bskyClient = React.useRef<BskyServiceWorkerClient | null>(null);
  const [users, setUsers] = useStorage<BskyUser[]>(
    {
      key: STORAGE_KEYS.DETECTED_BSKY_USERS,
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? [] : v),
  );
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
    async (usersData: CrawledUserInfo[]) => {
      for (const userData of usersData) {
        const searchResult = await searchBskyUser({
          client: bskyClient.current,
          userData,
        });
        if (searchResult) {
          await setUsers((prev) => {
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
    [setUsers],
  );

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const startRetrieveLoop = React.useCallback(
    async (messageName: string) => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      let index = 0;

      const service = getService(messageName);

      // loop until we get to the bottom
      while (!isBottomReached) {
        if (signal.aborted) {
          break;
        }

        const data = service.getCrawledUsers();
        await retrieveBskyUsers(data);

        const isEnd = await service.performScrollAndCheckEnd();

        if (isEnd) {
          setIsBottomReached(true);
          setLoading(false);
          break;
        }

        index++;
        if (process.env.NODE_ENV === "development" && index > 5) {
          setLoading(false);
          break;
        }
      }
    },
    [retrieveBskyUsers, isBottomReached],
  );

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

    startRetrieveLoop(messageName).catch((e) => {
      console.error(e);
      setErrorMessage(e.message);
      setLoading(false);
    });
    setLoading(true);
    await setUsers([]);
    showModal();
  }, []);

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
