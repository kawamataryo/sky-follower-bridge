import type { Agent, AppBskyActorDefs } from "@atproto/api";
import type { CrawledUserInfo } from "~/types";
import { isImpersonationUser } from "./bskyHelpers";
import { isOneSymbol } from "./utils";

type ProfileView = AppBskyActorDefs.ProfileView;

export function buildSearchTerms(userData: CrawledUserInfo): string[] {
  const candidates = [
    userData.bskyHandleInDescription,
    userData.accountNameRemoveUnderscore,
    userData.accountNameReplaceUnderscore,
    userData.displayName,
  ];

  const seen = new Set<string>();
  const terms: string[] = [];

  for (const term of candidates) {
    if (term && !isOneSymbol(term) && !seen.has(term)) {
      seen.add(term);
      terms.push(term);
    }
  }

  return terms;
}

export async function searchBskyUser({
  agent,
  userData,
}: {
  agent: Agent;
  userData: CrawledUserInfo;
}): Promise<ProfileView[]> {
  const searchTerms = buildSearchTerms(userData);
  const detectedUsers: Record<string, ProfileView> = {};

  for (const term of searchTerms) {
    try {
      const response = await agent.searchActors({ q: term, limit: 3 });
      for (const actor of response.data.actors) {
        if (!isImpersonationUser(actor)) {
          detectedUsers[actor.did] = actor;
        }
      }
    } catch (e) {
      console.error("Search error:", e);
    }
  }

  return Object.values(detectedUsers);
}
