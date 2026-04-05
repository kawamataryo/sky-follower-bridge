import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import type { AppBskyActorDefs, AtpAgent } from "@atproto/api";
import { isSimilarUser } from "~/lib/bskyHelpers";
import { searchBskyUser } from "~/lib/fuzzySearch";
import { wait } from "~/lib/utils";
import { SCAN_BATCH_DELAY_MS, SCAN_BATCH_SIZE } from "~/lib/constants";
import type { BskyUser, CrawledUserInfo, ScanStatus } from "~/types";

type ScanState = {
  status: ScanStatus;
  scannedCount: number;
  matchedUsers: BskyUser[];
  setStatus: (status: ScanStatus) => void;
  processUsers: (users: CrawledUserInfo[], agent: AtpAgent) => Promise<void>;
  reset: () => void;
};

const ScanContext = createContext<ScanState | null>(null);

function profileToBskyUser(
  profile: AppBskyActorDefs.ProfileView,
  crawledUser: CrawledUserInfo,
  matchType: string,
): BskyUser {
  return {
    did: profile.did,
    avatar: profile.avatar ?? "",
    displayName: profile.displayName ?? "",
    handle: profile.handle,
    description: profile.description ?? "",
    matchType: matchType as BskyUser["matchType"],
    isFollowing: !!profile.viewer?.following,
    followingUri: profile.viewer?.following ?? null,
    originalAvatar: crawledUser.originalAvatar,
    originalHandle: crawledUser.accountName,
    originalDisplayName: crawledUser.displayName,
    originalProfileLink: crawledUser.originalProfileLink,
  };
}

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [scannedCount, setScannedCount] = useState(0);
  const [matchedUsers, setMatchedUsers] = useState<BskyUser[]>([]);
  const matchedDids = useRef(new Set<string>());

  const processUsers = useCallback(
    async (users: CrawledUserInfo[], agent: AtpAgent) => {
      for (let i = 0; i < users.length; i += SCAN_BATCH_SIZE) {
        const batch = users.slice(i, i + SCAN_BATCH_SIZE);

        await Promise.all(
          batch.map(async (crawledUser) => {
            try {
              const candidates = await searchBskyUser({
                agent,
                userData: crawledUser,
              });

              for (const candidate of candidates) {
                const { isSimilar, type } = isSimilarUser(
                  crawledUser,
                  candidate,
                );
                if (isSimilar && !matchedDids.current.has(candidate.did)) {
                  matchedDids.current.add(candidate.did);
                  const bskyUser = profileToBskyUser(
                    candidate,
                    crawledUser,
                    type,
                  );
                  setMatchedUsers((prev) => [...prev, bskyUser]);
                }
              }
            } catch (e) {
              console.error("Match error:", e);
            }
          }),
        );

        setScannedCount((prev) => prev + batch.length);

        if (i + SCAN_BATCH_SIZE < users.length) {
          await wait(SCAN_BATCH_DELAY_MS);
        }
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setScannedCount(0);
    setMatchedUsers([]);
    matchedDids.current.clear();
  }, []);

  return (
    <ScanContext.Provider
      value={{ status, scannedCount, matchedUsers, setStatus, processUsers, reset }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan(): ScanState {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error("useScan must be used within ScanProvider");
  return ctx;
}
