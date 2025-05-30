import type { AtpSessionData } from "@atproto/api";
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { sendToBackground } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import consola from "consola";
import React, { useEffect } from "react";
import { P, match } from "ts-pattern";
import { BskyServiceWorkerClient } from "~lib/bskyServiceWorkerClient";
import { getChromeStorage } from "~lib/chromeHelper";
import { MESSAGE_NAMES, SERVICE_TYPE, STORAGE_KEYS } from "~lib/constants";
import { searchBskyUser } from "~lib/searchBskyUsers";
import { wait } from "~lib/utils";
import { FacebookService } from "~services/facebookService";
import { InstagramService } from "~services/instagramService";
import { ThreadsService } from "~services/threadsService";
import { TikTokService } from "~services/tikTokService";
import { XService } from "~services/xService";
import type {
  BskyUser,
  CrawledUserInfo,
  IService,
  MatchType,
  MessageName,
  ServiceType,
} from "~types";

const getServiceType = (messageName: MessageName): ServiceType => {
  return match(messageName)
    .returnType<(typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE]>()
    .with(
      P.union(
        MESSAGE_NAMES.SEARCH_BSKY_USER_ON_FOLLOW_PAGE,
        MESSAGE_NAMES.SEARCH_BSKY_USER_ON_LIST_MEMBERS_PAGE,
        MESSAGE_NAMES.SEARCH_BSKY_USER_ON_BLOCK_PAGE,
      ),
      () => SERVICE_TYPE.X,
    )
    .with(
      MESSAGE_NAMES.SEARCH_BSKY_USER_ON_THREADS_PAGE,
      () => SERVICE_TYPE.THREADS,
    )
    .with(
      MESSAGE_NAMES.SEARCH_BSKY_USER_ON_INSTAGRAM_PAGE,
      () => SERVICE_TYPE.INSTAGRAM,
    )
    .with(
      MESSAGE_NAMES.SEARCH_BSKY_USER_ON_TIKTOK_PAGE,
      () => SERVICE_TYPE.TIKTOK,
    )
    .with(
      MESSAGE_NAMES.SEARCH_BSKY_USER_ON_FACEBOOK_PAGE,
      () => SERVICE_TYPE.FACEBOOK,
    )
    .run();
};

const buildService = (
  serviceType: ServiceType,
  messageName: MessageName,
): IService => {
  return match(serviceType)
    .returnType<IService>()
    .with(SERVICE_TYPE.X, () => new XService(messageName))
    .with(SERVICE_TYPE.THREADS, () => new ThreadsService(messageName))
    .with(SERVICE_TYPE.INSTAGRAM, () => new InstagramService(messageName))
    .with(SERVICE_TYPE.TIKTOK, () => new TikTokService(messageName))
    .with(SERVICE_TYPE.FACEBOOK, () => new FacebookService(messageName))
    .run();
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
  const [currentService, setCurrentService] = React.useState<
    (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE]
  >(SERVICE_TYPE.X);
  const [scannedUserCount, setScannedUserCount] = React.useState(0);

  const [retrievalParams, setRetrievalParams] = React.useState<null | {
    session: AtpSessionData;
    messageName: (typeof MESSAGE_NAMES)[keyof typeof MESSAGE_NAMES];
  }>(null);

  const searchAndStoreBskyUser = React.useCallback(
    async (
      userData: CrawledUserInfo,
      processExtractedData: (user: CrawledUserInfo) => Promise<CrawledUserInfo>,
    ) => {
      try {
        const searchResult = await searchBskyUser({
          client: bskyClient.current,
          userData,
        });
        if (searchResult) {
          // Post processing
          const processedUser = await processExtractedData(userData);
          // Image comparison
          const {
            result: similarityScore,
            error: getImageSimilarityScoreError,
          } = await sendToBackground({
            name: "getImageSimilarityScore",
            body: {
              url1: processedUser.originalAvatarDataUrl,
              url2: searchResult.bskyProfile.avatar,
            },
          });
          if (getImageSimilarityScoreError) {
            consola.error(getImageSimilarityScoreError);
          }
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
                matchType: searchResult.matchType as MatchType,
                isFollowing: !!searchResult.bskyProfile.viewer?.following,
                followingUri: searchResult.bskyProfile.viewer?.following,
                isBlocking: !!searchResult.bskyProfile.viewer?.blocking,
                blockingUri: searchResult.bskyProfile.viewer?.blocking,
                originalAvatar: processedUser.originalAvatar,
                originalHandle: processedUser.accountName,
                originalDisplayName: processedUser.displayName,
                originalProfileLink: processedUser.originalProfileLink,
                avatarSimilarityScore: similarityScore ?? 0,
              },
            ];
          });
        }
      } catch (error) {
        consola.error(error);
      }
    },
    [setUsers],
  );

  const retrieveBskyUsers = React.useCallback(
    async (
      usersData: CrawledUserInfo[],
      processExtractedData: (user: CrawledUserInfo) => Promise<CrawledUserInfo>,
    ) => {
      const promises = [];
      for (const userData of usersData) {
        setScannedUserCount((prev) => prev + 1);
        await wait(100);
        promises.push(searchAndStoreBskyUser(userData, processExtractedData));
      }
      await Promise.all(promises);
    },
    [searchAndStoreBskyUser],
  );

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const startRetrieveLoop = React.useCallback(
    async (service: IService) => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // loop until we get to the bottom
      while (true) {
        if (signal.aborted) {
          break;
        }

        const data = service.getCrawledUsers();
        service.scrollToBottom();

        await retrieveBskyUsers(data, service.processExtractedData);

        // wait load more users
        await wait(2000);

        // first check
        if (service.checkEnd()) {
          await wait(8000);
        }

        // second check
        if (service.checkEnd()) {
          setIsBottomReached(true);
          setLoading(false);
          break;
        }
      }
    },
    [retrieveBskyUsers],
  );

  const stopRetrieveLoop = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const initialize = React.useCallback(async () => {
    const storage = await getChromeStorage<{
      [STORAGE_KEYS.BSKY_CLIENT_SESSION]: AtpSessionData;
      [STORAGE_KEYS.BSKY_MESSAGE_NAME]: MessageName;
    }>([STORAGE_KEYS.BSKY_CLIENT_SESSION, STORAGE_KEYS.BSKY_MESSAGE_NAME]);

    const messageName = storage[STORAGE_KEYS.BSKY_MESSAGE_NAME];
    const session = storage[STORAGE_KEYS.BSKY_CLIENT_SESSION];

    setRetrievalParams({
      session,
      messageName,
    });

    bskyClient.current = new BskyServiceWorkerClient(session);

    const serviceType = getServiceType(messageName);
    setCurrentService(serviceType);
    const service = buildService(serviceType, messageName);

    const [isTargetPage, errorMessage] = service.isTargetPage();
    if (!isTargetPage) {
      throw new Error(errorMessage);
    }

    setErrorMessage("");
    await setUsers([]);
    setScannedUserCount(0);
    setLoading(true);

    startRetrieveLoop(service).catch((e) => {
      console.error(e);
      setErrorMessage(e.message);
      setLoading(false);
    });
  }, []);

  const restart = React.useCallback(() => {
    const service = buildService(currentService, retrievalParams.messageName);
    startRetrieveLoop(service).catch((e) => {
      setErrorMessage(e.message);
      setLoading(false);
    });
    setErrorMessage("");
    setLoading(true);
  }, [currentService, retrievalParams, startRetrieveLoop]);

  const isRateLimitError = React.useMemo(() => {
    // TODO: improve this logic
    return errorMessage.toLowerCase().replace(" ", "").includes("ratelimit");
  }, [errorMessage]);

  const isSucceeded = React.useMemo(
    () => !loading && !errorMessage && users.length > 0,
    [loading, errorMessage, users.length],
  );

  useEffect(() => {
    return () => {
      stopRetrieveLoop();
    };
  }, [stopRetrieveLoop]);

  return {
    initialize,
    users,
    loading,
    errorMessage,
    isRateLimitError,
    restart,
    isSucceeded,
    isBottomReached,
    stopRetrieveLoop,
    currentService,
    scannedUserCount,
  };
};
