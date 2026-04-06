# Sky Follower Bridge Mobile App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React Native (Expo) mobile app that scrapes X (Twitter) following lists via WebView and matches users with Bluesky accounts.

**Architecture:** WebView-based scraping engine communicates with native UI via postMessage. Bluesky API is called directly via `@atproto/api`. OAuth uses `expo-auth-session` with system browser, falling back to app password auth.

**Tech Stack:** Expo (dev-client), Expo Router, react-native-webview, @atproto/api, expo-auth-session, expo-secure-store, jaro-winkler, Vitest

---

## File Structure

```
mobile/
├── app/
│   ├── _layout.tsx               # Root layout + providers
│   ├── index.tsx                  # Welcome screen
│   ├── auth.tsx                   # Bluesky auth screen
│   ├── x-login-guide.tsx          # X login explanation
│   ├── x-login.tsx                # X WebView login
│   ├── scan.tsx                   # Scan progress + off-screen WebView
│   └── results.tsx                # Results list
├── components/
│   ├── UserCard.tsx               # Matched user card
│   └── ScanProgress.tsx           # Progress indicator
├── contexts/
│   ├── AuthContext.tsx             # Bluesky auth state
│   └── ScanContext.tsx             # Scan state
├── lib/
│   ├── constants.ts               # App constants
│   ├── bskyAgent.ts               # AtpAgent wrapper
│   ├── bskyOAuth.ts               # OAuth via expo-auth-session
│   ├── sessionStorage.ts          # expo-secure-store wrapper
│   ├── fuzzySearch.ts             # Matching algorithm (ported)
│   ├── bskyHelpers.ts             # isSimilarUser, isImpersonationUser (ported)
│   ├── utils.ts                   # isOneSymbol, wait
│   └── webviewScripts.ts          # Injected JS for WebView
├── services/
│   └── xScraper.ts                # Scraping logic coordinator
├── types/
│   └── index.ts                   # Type definitions
├── __tests__/
│   ├── bskyHelpers.test.ts
│   ├── fuzzySearch.test.ts
│   ├── webviewScripts.test.ts
│   └── utils.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

### Task 1: Expo Project Scaffolding

**Files:**
- Create: `mobile/package.json`
- Create: `mobile/app.json`
- Create: `mobile/tsconfig.json`
- Create: `mobile/vitest.config.ts`
- Create: `mobile/app/_layout.tsx`
- Create: `mobile/app/index.tsx`

- [ ] **Step 1: Create Expo project**

```bash
cd /Users/ryo/ghq/github.com/kawamataryo/sky-follower-bridge
npx create-expo-app@latest mobile --template blank-typescript
```

- [ ] **Step 2: Install core dependencies**

```bash
cd mobile
npx expo install expo-router expo-auth-session expo-secure-store expo-crypto expo-web-browser expo-linking react-native-webview react-native-safe-area-context react-native-screens
npm install @atproto/api jaro-winkler
npm install -D vitest @testing-library/react-native happy-dom
```

- [ ] **Step 3: Configure app.json for Expo Router and deep linking**

Update `mobile/app.json`:

```json
{
  "expo": {
    "name": "Sky Follower Bridge",
    "slug": "sky-follower-bridge",
    "version": "1.0.0",
    "scheme": "sky-follower-bridge",
    "platforms": ["ios", "android"],
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "web": {
      "bundler": "metro"
    },
    "ios": {
      "bundleIdentifier": "dev.sky-follower-bridge.mobile"
    },
    "android": {
      "package": "dev.sky_follower_bridge.mobile"
    }
  }
}
```

- [ ] **Step 4: Configure tsconfig.json**

Update `mobile/tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "~/*": ["./*"]
    }
  }
}
```

- [ ] **Step 5: Create vitest.config.ts**

Create `mobile/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 6: Add test script to package.json**

Add to `mobile/package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

- [ ] **Step 7: Create minimal root layout**

Create `mobile/app/_layout.tsx`:

```tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
```

- [ ] **Step 8: Create placeholder index screen**

Create `mobile/app/index.tsx`:

```tsx
import { View, Text, StyleSheet } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sky Follower Bridge</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
```

- [ ] **Step 9: Verify project runs**

```bash
cd mobile
npx expo start
```

Expected: Metro bundler starts, app loads with "Sky Follower Bridge" text.

- [ ] **Step 10: Commit**

```bash
git add mobile/
git commit -m "feat(mobile): scaffold Expo project with dependencies"
```

---

### Task 2: Type Definitions and Constants

**Files:**
- Create: `mobile/types/index.ts`
- Create: `mobile/lib/constants.ts`
- Create: `mobile/lib/utils.ts`
- Create: `mobile/__tests__/utils.test.ts`

- [ ] **Step 1: Write failing test for isOneSymbol**

Create `mobile/__tests__/utils.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { isOneSymbol } from "~/lib/utils";

describe("isOneSymbol", () => {
  it("should return true for a single symbol character", () => {
    expect(isOneSymbol("!")).toBe(true);
    expect(isOneSymbol("@")).toBe(true);
    expect(isOneSymbol("#")).toBe(true);
  });

  it("should return false for letters, digits, or multi-char strings", () => {
    expect(isOneSymbol("a")).toBe(false);
    expect(isOneSymbol("1")).toBe(false);
    expect(isOneSymbol("ab")).toBe(false);
    expect(isOneSymbol("hello")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isOneSymbol("")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx vitest run __tests__/utils.test.ts
```

Expected: FAIL — `Cannot find module '~/lib/utils'`

- [ ] **Step 3: Create type definitions**

Create `mobile/types/index.ts`:

```typescript
export type MatchType = "handle" | "display_name" | "description" | "none";

export type CrawledUserInfo = {
  accountName: string;
  displayName: string;
  accountNameRemoveUnderscore: string;
  accountNameReplaceUnderscore: string;
  bskyHandleInDescription: string;
  originalAvatar: string;
  originalProfileLink: string;
};

export type BskyUser = {
  did: string;
  avatar: string;
  displayName: string;
  handle: string;
  description: string;
  matchType: MatchType;
  isFollowing: boolean;
  followingUri: string | null;
  originalAvatar: string;
  originalHandle: string;
  originalDisplayName: string;
  originalProfileLink: string;
};

export type ScanStatus =
  | "idle"
  | "logging_in"
  | "scanning"
  | "completed"
  | "error";

export type WebViewMessage =
  | { type: "users"; payload: CrawledUserInfo[] }
  | { type: "scroll_end" }
  | { type: "login_detected"; url: string }
  | { type: "error"; message: string };

export type SessionData =
  | { authMethod: "oauth"; sub: string }
  | { authMethod: "app-password"; service: string; session: string };
```

- [ ] **Step 4: Create constants**

Create `mobile/lib/constants.ts`:

```typescript
export const BSKY_USER_MATCH_TYPE = {
  HANDLE: "handle",
  DISPLAY_NAME: "display_name",
  DESCRIPTION: "description",
  NONE: "none",
} as const;

export const BSKY_PROFILE_LABEL = {
  IMPERSONATION: "impersonation",
} as const;

export const BSKY_DOMAIN = "bsky.social";

export const BSKY_OAUTH_CLIENT_ID =
  "https://server.sky-follower-bridge.dev/oauth/client-metadata.json";

export const BSKY_OAUTH_REDIRECT_URI =
  "https://server.sky-follower-bridge.dev/oauth/callback";

export const BSKY_OAUTH_SCOPE = "atproto transition:generic";

export const X_FOLLOW_PAGE_URL = "https://x.com/following";
export const X_LOGIN_URL = "https://x.com/i/flow/login";

export const USER_CELL_SELECTOR =
  '[data-testid="primaryColumn"] [data-testid="UserCell"]';

export const SCAN_BATCH_SIZE = 10;
export const SCAN_BATCH_DELAY_MS = 300;
export const SCROLL_END_CHECK_DELAY_MS = 8000;

export const SECURE_STORE_KEYS = {
  SESSION: "sky_follower_bridge_session",
} as const;
```

- [ ] **Step 5: Create utils**

Create `mobile/lib/utils.ts`:

```typescript
export const isOneSymbol = (str: string): boolean => {
  return /^[^\w\s]$/.test(str);
};

export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
```

- [ ] **Step 6: Run test to verify it passes**

```bash
cd mobile && npx vitest run __tests__/utils.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add mobile/types/ mobile/lib/constants.ts mobile/lib/utils.ts mobile/__tests__/utils.test.ts
git commit -m "feat(mobile): add type definitions, constants, and utils"
```

---

### Task 3: Bluesky Helpers (ported with tests)

**Files:**
- Create: `mobile/lib/bskyHelpers.ts`
- Create: `mobile/__tests__/bskyHelpers.test.ts`

- [ ] **Step 1: Write failing tests**

Create `mobile/__tests__/bskyHelpers.test.ts`:

```typescript
import type { AppBskyActorDefs } from "@atproto/api";
import { describe, expect, it } from "vitest";
import type { CrawledUserInfo } from "~/types";
import { isImpersonationUser, isSimilarUser } from "~/lib/bskyHelpers";

type ProfileView = AppBskyActorDefs.ProfileView;

const mockProfile = (overrides: Partial<ProfileView>): ProfileView => ({
  did: "did:plc:mock",
  handle: "foo.bsky.social",
  displayName: "foo display name",
  avatar: "",
  description: "",
  indexedAt: "",
  labels: [],
  ...overrides,
});

const mockCrawledUser = (
  overrides?: Partial<CrawledUserInfo>,
): CrawledUserInfo => ({
  accountName: "bar",
  displayName: "bar display name",
  bskyHandleInDescription: "",
  originalAvatar: "",
  originalProfileLink: "",
  accountNameRemoveUnderscore: "bar",
  accountNameReplaceUnderscore: "bar",
  ...overrides,
});

describe("isSimilarUser", () => {
  it("returns false when profile is undefined", () => {
    const result = isSimilarUser(mockCrawledUser(), undefined);
    expect(result.isSimilar).toBe(false);
    expect(result.type).toBe("none");
  });

  it("matches by description (bsky handle in bio)", () => {
    const result = isSimilarUser(
      mockCrawledUser({ bskyHandleInDescription: "match" }),
      mockProfile({ handle: "match.bsky.social" }),
    );
    expect(result.isSimilar).toBe(true);
    expect(result.type).toBe("description");
  });

  it("matches by exact handle", () => {
    const result = isSimilarUser(
      mockCrawledUser({ accountName: "testuser" }),
      mockProfile({ handle: "testuser.bsky.social" }),
    );
    expect(result.isSimilar).toBe(true);
    expect(result.type).toBe("handle");
  });

  it("matches after underscore removal", () => {
    const result = isSimilarUser(
      mockCrawledUser({
        accountName: "test_user",
        accountNameRemoveUnderscore: "testuser",
      }),
      mockProfile({ handle: "testuser.bsky.social" }),
    );
    expect(result.isSimilar).toBe(true);
    expect(result.type).toBe("handle");
  });

  it("matches by fuzzy handle (Jaro-Winkler > 0.92)", () => {
    const result = isSimilarUser(
      mockCrawledUser({ accountName: "alicee" }),
      mockProfile({ handle: "alice.bsky.social" }),
    );
    expect(result.isSimilar).toBe(true);
    expect(result.type).toBe("handle");
  });

  it("matches by display name (case insensitive)", () => {
    const result = isSimilarUser(
      mockCrawledUser({ displayName: "test user" }),
      mockProfile({ displayName: "Test User" }),
    );
    expect(result.isSimilar).toBe(true);
    expect(result.type).toBe("display_name");
  });

  it("returns false when nothing matches", () => {
    const result = isSimilarUser(
      mockCrawledUser({ accountName: "completely_different" }),
      mockProfile({ handle: "nomatch.bsky.social", displayName: "No Match" }),
    );
    expect(result.isSimilar).toBe(false);
    expect(result.type).toBe("none");
  });
});

describe("isImpersonationUser", () => {
  it("returns true when impersonation label exists", () => {
    const profile = mockProfile({
      labels: [
        {
          val: "impersonation",
          src: "did:plc:src",
          uri: "at://did:plc:fake/post/123",
          cts: new Date().toISOString(),
        },
      ],
    });
    expect(isImpersonationUser(profile)).toBe(true);
  });

  it("returns false when no labels", () => {
    expect(isImpersonationUser(mockProfile({ labels: [] }))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx vitest run __tests__/bskyHelpers.test.ts
```

Expected: FAIL — `Cannot find module '~/lib/bskyHelpers'`

- [ ] **Step 3: Implement bskyHelpers**

Create `mobile/lib/bskyHelpers.ts`:

```typescript
import type { AppBskyActorDefs } from "@atproto/api";
import distance from "jaro-winkler";
import type { CrawledUserInfo, MatchType } from "~/types";
import { BSKY_PROFILE_LABEL, BSKY_USER_MATCH_TYPE } from "./constants";

type ProfileView = AppBskyActorDefs.ProfileView;

export const isSimilarUser = (
  crawledUser: CrawledUserInfo,
  bskyProfile: ProfileView | undefined,
): { isSimilar: boolean; type: MatchType } => {
  if (!bskyProfile) {
    return { isSimilar: false, type: BSKY_USER_MATCH_TYPE.NONE };
  }

  // Check if bsky handle appears in the user's description/bio
  if (crawledUser.bskyHandleInDescription) {
    const bskyHandle = bskyProfile.handle.replace("@", "");
    const descHandle = crawledUser.bskyHandleInDescription.replace("@", "");
    if (bskyHandle === descHandle || bskyHandle.includes(descHandle)) {
      return { isSimilar: true, type: BSKY_USER_MATCH_TYPE.DESCRIPTION };
    }
  }

  // Lowercase all crawled user fields for comparison
  const lower = {
    accountName: crawledUser.accountName.toLowerCase(),
    accountNameRemoveUnderscore:
      crawledUser.accountNameRemoveUnderscore.toLowerCase(),
    accountNameReplaceUnderscore:
      crawledUser.accountNameReplaceUnderscore.toLowerCase(),
    displayName: crawledUser.displayName.toLowerCase(),
  };

  const bskyHandle = bskyProfile.handle
    .toLowerCase()
    .replace("@", "")
    .split(".")[0];

  // Handle match (exact or fuzzy)
  if (
    lower.accountName === bskyHandle ||
    lower.accountNameRemoveUnderscore === bskyHandle ||
    lower.accountNameReplaceUnderscore === bskyHandle ||
    distance(lower.accountName, bskyHandle) > 0.92
  ) {
    return { isSimilar: true, type: BSKY_USER_MATCH_TYPE.HANDLE };
  }

  // Display name match (case insensitive)
  if (lower.displayName === bskyProfile.displayName?.toLowerCase()) {
    return { isSimilar: true, type: BSKY_USER_MATCH_TYPE.DISPLAY_NAME };
  }

  return { isSimilar: false, type: BSKY_USER_MATCH_TYPE.NONE };
};

export const isImpersonationUser = (user: ProfileView): boolean => {
  return (
    user.labels?.some(
      (label) => label.val === BSKY_PROFILE_LABEL.IMPERSONATION,
    ) ?? false
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd mobile && npx vitest run __tests__/bskyHelpers.test.ts
```

Expected: PASS (all 7 tests)

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/bskyHelpers.ts mobile/__tests__/bskyHelpers.test.ts
git commit -m "feat(mobile): port bskyHelpers with isSimilarUser matching logic"
```

---

### Task 4: Fuzzy Search Logic (ported with tests)

**Files:**
- Create: `mobile/lib/fuzzySearch.ts`
- Create: `mobile/__tests__/fuzzySearch.test.ts`

- [ ] **Step 1: Write failing tests**

Create `mobile/__tests__/fuzzySearch.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest";
import { buildSearchTerms } from "~/lib/fuzzySearch";

describe("buildSearchTerms", () => {
  it("returns unique non-symbol terms in priority order", () => {
    const terms = buildSearchTerms({
      bskyHandleInDescription: "alice.bsky.social",
      accountNameRemoveUnderscore: "alice",
      accountNameReplaceUnderscore: "alice",
      displayName: "Alice Smith",
      accountName: "alice",
      originalAvatar: "",
      originalProfileLink: "",
    });

    expect(terms).toEqual(["alice.bsky.social", "alice", "Alice Smith"]);
  });

  it("filters out single symbol characters", () => {
    const terms = buildSearchTerms({
      bskyHandleInDescription: "",
      accountNameRemoveUnderscore: "!",
      accountNameReplaceUnderscore: "@",
      displayName: "Bob",
      accountName: "bob",
      originalAvatar: "",
      originalProfileLink: "",
    });

    expect(terms).toEqual(["Bob"]);
  });

  it("filters out empty strings", () => {
    const terms = buildSearchTerms({
      bskyHandleInDescription: "",
      accountNameRemoveUnderscore: "",
      accountNameReplaceUnderscore: "",
      displayName: "Carol",
      accountName: "carol",
      originalAvatar: "",
      originalProfileLink: "",
    });

    expect(terms).toEqual(["Carol"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx vitest run __tests__/fuzzySearch.test.ts
```

Expected: FAIL — `Cannot find module '~/lib/fuzzySearch'`

- [ ] **Step 3: Implement fuzzySearch**

Create `mobile/lib/fuzzySearch.ts`:

```typescript
import type { AppBskyActorDefs, AtpAgent } from "@atproto/api";
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
  agent: AtpAgent;
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd mobile && npx vitest run __tests__/fuzzySearch.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/fuzzySearch.ts mobile/__tests__/fuzzySearch.test.ts
git commit -m "feat(mobile): port fuzzy search logic for Bluesky user matching"
```

---

### Task 5: WebView Injection Scripts (with tests)

**Files:**
- Create: `mobile/lib/webviewScripts.ts`
- Create: `mobile/__tests__/webviewScripts.test.ts`

- [ ] **Step 1: Write failing tests**

Create `mobile/__tests__/webviewScripts.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import {
  buildScrapeScript,
  parseExtractedUsers,
} from "~/lib/webviewScripts";

describe("parseExtractedUsers", () => {
  it("parses valid user data from WebView message", () => {
    const message = JSON.stringify({
      type: "users",
      payload: [
        {
          accountName: "alice",
          displayName: "Alice",
          accountNameRemoveUnderscore: "alice",
          accountNameReplaceUnderscore: "alice",
          bskyHandleInDescription: "",
          originalAvatar: "https://pbs.twimg.com/photo.jpg",
          originalProfileLink: "https://x.com/alice",
        },
      ],
    });

    const result = parseExtractedUsers(message);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("users");
    expect(result!.payload).toHaveLength(1);
    expect(result!.payload[0].accountName).toBe("alice");
  });

  it("parses scroll_end message", () => {
    const message = JSON.stringify({ type: "scroll_end" });
    const result = parseExtractedUsers(message);
    expect(result).toEqual({ type: "scroll_end" });
  });

  it("returns null for invalid JSON", () => {
    const result = parseExtractedUsers("not json");
    expect(result).toBeNull();
  });
});

describe("buildScrapeScript", () => {
  it("returns a string containing the UserCell selector", () => {
    const script = buildScrapeScript();
    expect(script).toContain('[data-testid="UserCell"]');
  });

  it("returns a string containing ReactNativeWebView.postMessage", () => {
    const script = buildScrapeScript();
    expect(script).toContain("ReactNativeWebView.postMessage");
  });

  it("returns a string containing scroll logic", () => {
    const script = buildScrapeScript();
    expect(script).toContain("scrollTop");
    expect(script).toContain("scrollHeight");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd mobile && npx vitest run __tests__/webviewScripts.test.ts
```

Expected: FAIL — `Cannot find module '~/lib/webviewScripts'`

- [ ] **Step 3: Implement webviewScripts**

Create `mobile/lib/webviewScripts.ts`:

```typescript
import type { WebViewMessage } from "~/types";
import { BSKY_DOMAIN, USER_CELL_SELECTOR } from "./constants";

export function parseExtractedUsers(
  messageData: string,
): WebViewMessage | null {
  try {
    return JSON.parse(messageData) as WebViewMessage;
  } catch {
    return null;
  }
}

export function buildScrapeScript(): string {
  return `
    (function() {
      const SELECTOR = '${USER_CELL_SELECTOR}';
      const BSKY_DOMAIN = '${BSKY_DOMAIN}';
      const crawledAccountNames = new Set();
      let isRunning = false;
      let checkEndCount = 0;

      function extractUserData(userCell) {
        const anchors = Array.from(userCell.querySelectorAll('a'));
        const [avatarEl, displayNameEl] = anchors;
        const accountName = (avatarEl?.getAttribute('href') || '').replace('/', '');
        const displayName = displayNameEl?.textContent || '';
        const accountNameRemoveUnderscore = accountName.replaceAll('_', '');
        const accountNameReplaceUnderscore = accountName.replaceAll('_', '-');

        const textContent = userCell.textContent || '';
        const bskyHandleRegex = new RegExp('([^/\\\\s]+\\\\.' + BSKY_DOMAIN + ')');
        const bskyHandleInDescription =
          textContent.match(bskyHandleRegex)?.[1] ||
          textContent.match(/bsky\\.app\\/profile\\/([^/\\s]+)…?/)?.[1]?.replace('…', '') ||
          '';

        const avatarImg = userCell.querySelector('[data-testid^="UserAvatar-Container"] img');
        const originalAvatar = avatarImg?.getAttribute('src') || '';

        return {
          accountName,
          displayName,
          accountNameRemoveUnderscore,
          accountNameReplaceUnderscore,
          bskyHandleInDescription,
          originalAvatar,
          originalProfileLink: 'https://x.com/' + accountName,
        };
      }

      function scrapeAndSend() {
        const cells = document.querySelectorAll(SELECTOR);
        const newUsers = [];

        cells.forEach(function(cell) {
          const data = extractUserData(cell);
          if (data.accountName && !crawledAccountNames.has(data.accountName)) {
            crawledAccountNames.add(data.accountName);
            newUsers.push(data);
          }
        });

        if (newUsers.length > 0) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'users', payload: newUsers })
          );
          checkEndCount = 0;
        }
      }

      function checkEnd() {
        const el = document.documentElement;
        return el.scrollTop + el.clientHeight >= el.scrollHeight;
      }

      async function run() {
        if (isRunning) return;
        isRunning = true;

        while (isRunning) {
          scrapeAndSend();
          document.documentElement.scrollTop += document.documentElement.scrollHeight;

          await new Promise(function(r) { setTimeout(r, 3000); });

          if (checkEnd()) {
            checkEndCount++;
            if (checkEndCount >= 2) {
              scrapeAndSend();
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'scroll_end' })
              );
              isRunning = false;
              return;
            }
            await new Promise(function(r) { setTimeout(r, 8000); });
          }
        }
      }

      function stop() {
        isRunning = false;
      }

      // Listen for commands from native side
      window.addEventListener('message', function(event) {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'start_scan') run();
          if (msg.type === 'stop_scan') stop();
        } catch(e) {}
      });

      // Auto-start scanning
      run();

      true; // Required for injectedJavaScript
    })();
  `;
}

export function buildNavigateScript(url: string): string {
  return `window.location.href = '${url}'; true;`;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd mobile && npx vitest run __tests__/webviewScripts.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/webviewScripts.ts mobile/__tests__/webviewScripts.test.ts
git commit -m "feat(mobile): add WebView injection scripts for X DOM scraping"
```

---

### Task 6: Session Storage and Bluesky Agent

**Files:**
- Create: `mobile/lib/sessionStorage.ts`
- Create: `mobile/lib/bskyAgent.ts`

- [ ] **Step 1: Create session storage wrapper**

Create `mobile/lib/sessionStorage.ts`:

```typescript
import * as SecureStore from "expo-secure-store";
import type { SessionData } from "~/types";
import { SECURE_STORE_KEYS } from "./constants";

export async function saveSession(session: SessionData): Promise<void> {
  await SecureStore.setItemAsync(
    SECURE_STORE_KEYS.SESSION,
    JSON.stringify(session),
  );
}

export async function loadSession(): Promise<SessionData | null> {
  const raw = await SecureStore.getItemAsync(SECURE_STORE_KEYS.SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.SESSION);
}
```

- [ ] **Step 2: Create Bluesky agent wrapper**

Create `mobile/lib/bskyAgent.ts`:

```typescript
import { AtpAgent } from "@atproto/api";
import type { SessionData } from "~/types";
import { BSKY_DOMAIN } from "./constants";

export async function createAgentWithAppPassword({
  identifier,
  password,
  authFactorToken,
  service,
}: {
  identifier: string;
  password: string;
  authFactorToken?: string;
  service?: string;
}): Promise<{ agent: AtpAgent; sessionData: SessionData }> {
  const serviceUrl = service || `https://${BSKY_DOMAIN}`;
  const agent = new AtpAgent({ service: serviceUrl });
  const response = await agent.login({
    identifier,
    password,
    authFactorToken,
  });

  const sessionData: SessionData = {
    authMethod: "app-password",
    service: serviceUrl,
    session: JSON.stringify(response.data),
  };

  return { agent, sessionData };
}

export async function restoreAgent(
  sessionData: SessionData,
): Promise<AtpAgent | null> {
  if (sessionData.authMethod === "app-password") {
    const agent = new AtpAgent({ service: sessionData.service });
    const session = JSON.parse(sessionData.session);
    await agent.resumeSession(session);
    return agent;
  }

  // OAuth restoration will be implemented in bskyOAuth.ts
  return null;
}
```

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/sessionStorage.ts mobile/lib/bskyAgent.ts
git commit -m "feat(mobile): add session storage and Bluesky agent wrapper"
```

---

### Task 7: Auth Context

**Files:**
- Create: `mobile/contexts/AuthContext.tsx`

- [ ] **Step 1: Create AuthContext**

Create `mobile/contexts/AuthContext.tsx`:

```tsx
import { AtpAgent } from "@atproto/api";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createAgentWithAppPassword, restoreAgent } from "~/lib/bskyAgent";
import { clearSession, loadSession, saveSession } from "~/lib/sessionStorage";
import type { SessionData } from "~/types";

type AuthState = {
  agent: AtpAgent | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  handle: string | null;
  loginWithAppPassword: (params: {
    identifier: string;
    password: string;
    authFactorToken?: string;
    service?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<AtpAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await loadSession();
        if (session) {
          const restored = await restoreAgent(session);
          if (restored) {
            setAgent(restored);
            setHandle(restored.session?.handle ?? null);
          }
        }
      } catch (e) {
        console.error("Session restore failed:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginWithAppPassword = useCallback(
    async (params: {
      identifier: string;
      password: string;
      authFactorToken?: string;
      service?: string;
    }) => {
      const { agent: newAgent, sessionData } =
        await createAgentWithAppPassword(params);
      await saveSession(sessionData);
      setAgent(newAgent);
      setHandle(newAgent.session?.handle ?? null);
    },
    [],
  );

  const logout = useCallback(async () => {
    await clearSession();
    setAgent(null);
    setHandle(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        agent,
        isLoading,
        isLoggedIn: agent !== null,
        handle,
        loginWithAppPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add mobile/contexts/AuthContext.tsx
git commit -m "feat(mobile): add AuthContext with app-password login and session restore"
```

---

### Task 8: Scan Context

**Files:**
- Create: `mobile/contexts/ScanContext.tsx`

- [ ] **Step 1: Create ScanContext**

Create `mobile/contexts/ScanContext.tsx`:

```tsx
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
                if (matchedDids.current.has(candidate.did)) continue;

                const { isSimilar, type } = isSimilarUser(
                  crawledUser,
                  candidate,
                );
                if (isSimilar) {
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
```

- [ ] **Step 2: Commit**

```bash
git add mobile/contexts/ScanContext.tsx
git commit -m "feat(mobile): add ScanContext with batch user processing"
```

---

### Task 9: Root Layout with Providers

**Files:**
- Modify: `mobile/app/_layout.tsx`

- [ ] **Step 1: Update root layout to wrap with providers**

Replace `mobile/app/_layout.tsx`:

```tsx
import { Stack } from "expo-router";
import { AuthProvider } from "~/contexts/AuthContext";
import { ScanProvider } from "~/contexts/ScanContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ScanProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="x-login-guide" />
          <Stack.Screen name="x-login" />
          <Stack.Screen name="scan" />
          <Stack.Screen name="results" />
        </Stack>
      </ScanProvider>
    </AuthProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add mobile/app/_layout.tsx
git commit -m "feat(mobile): wire up AuthProvider and ScanProvider in root layout"
```

---

### Task 10: Welcome Screen

**Files:**
- Modify: `mobile/app/index.tsx`

- [ ] **Step 1: Implement Welcome screen**

Replace `mobile/app/index.tsx`:

```tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "~/contexts/AuthContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const { isLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace("/x-login-guide");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0085FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sky Follower Bridge</Text>
      <Text style={styles.subtitle}>
        Find your X follows on Bluesky
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/auth")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#0085FF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add mobile/app/index.tsx
git commit -m "feat(mobile): implement Welcome screen with auto-redirect"
```

---

### Task 11: Auth Screen

**Files:**
- Create: `mobile/app/auth.tsx`

- [ ] **Step 1: Implement Auth screen with App Password form**

Create `mobile/app/auth.tsx`:

```tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "~/contexts/AuthContext";

export default function AuthScreen() {
  const router = useRouter();
  const { loginWithAppPassword } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter your identifier and app password.");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithAppPassword({
        identifier: identifier.trim(),
        password: password.trim(),
      });
      router.replace("/x-login-guide");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      Alert.alert("Login Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Login to Bluesky</Text>
        <Text style={styles.subtitle}>
          Use your handle and an App Password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Handle (e.g. alice.bsky.social)"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="App Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0085FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add mobile/app/auth.tsx
git commit -m "feat(mobile): implement Bluesky auth screen with app-password login"
```

---

### Task 12: X Login Guide Screen

**Files:**
- Create: `mobile/app/x-login-guide.tsx`

- [ ] **Step 1: Implement X Login Guide screen**

Create `mobile/app/x-login-guide.tsx`:

```tsx
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function XLoginGuideScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔍</Text>
      <Text style={styles.title}>Scan your X follows</Text>
      <Text style={styles.description}>
        Next, you'll log in to X (Twitter) so we can scan your following list
        and find matching Bluesky accounts.
      </Text>
      <Text style={styles.note}>
        Your X credentials are only used within the app's browser and are never
        sent to our servers.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/x-login")}
      >
        <Text style={styles.buttonText}>Open X Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#444",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  note: {
    fontSize: 13,
    color: "#888",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#0085FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add mobile/app/x-login-guide.tsx
git commit -m "feat(mobile): add X login guide screen with privacy note"
```

---

### Task 13: X WebView Login Screen

**Files:**
- Create: `mobile/app/x-login.tsx`

- [ ] **Step 1: Implement X WebView login screen**

Create `mobile/app/x-login.tsx`:

```tsx
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import { X_LOGIN_URL } from "~/lib/constants";

const X_HOME_PATTERNS = [
  /^https:\/\/(x|twitter)\.com\/home/,
  /^https:\/\/(x|twitter)\.com\/$/,
  /^https:\/\/(x|twitter)\.com\/?(\?|#|$)/,
];

export default function XLoginScreen() {
  const router = useRouter();
  const webviewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasRedirected = useRef(false);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    if (hasRedirected.current) return;

    const isLoggedIn = X_HOME_PATTERNS.some((pattern) =>
      pattern.test(navState.url),
    );

    if (isLoggedIn) {
      hasRedirected.current = true;
      router.replace("/scan");
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0085FF" />
        </View>
      )}
      <WebView
        ref={webviewRef}
        source={{ uri: X_LOGIN_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 1,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add mobile/app/x-login.tsx
git commit -m "feat(mobile): implement X WebView login with auto-redirect on login detection"
```

---

### Task 14: Scan Screen (core feature)

**Files:**
- Create: `mobile/components/ScanProgress.tsx`
- Create: `mobile/app/scan.tsx`

- [ ] **Step 1: Create ScanProgress component**

Create `mobile/components/ScanProgress.tsx`:

```tsx
import { StyleSheet, Text, View } from "react-native";

type Props = {
  scannedCount: number;
  matchedCount: number;
};

export function ScanProgress({ scannedCount, matchedCount }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Scanned</Text>
        <Text style={styles.value}>{scannedCount}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Matched</Text>
        <Text style={[styles.value, styles.matchedValue]}>{matchedCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  row: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#ddd",
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  value: {
    fontSize: 32,
    fontWeight: "bold",
  },
  matchedValue: {
    color: "#0085FF",
  },
});
```

- [ ] **Step 2: Implement Scan screen with off-screen WebView**

Create `mobile/app/scan.tsx`:

```tsx
import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import { ScanProgress } from "~/components/ScanProgress";
import { useAuth } from "~/contexts/AuthContext";
import { useScan } from "~/contexts/ScanContext";
import { X_FOLLOW_PAGE_URL } from "~/lib/constants";
import { parseExtractedUsers } from "~/lib/webviewScripts";
import { buildScrapeScript } from "~/lib/webviewScripts";

export default function ScanScreen() {
  const router = useRouter();
  const { agent } = useAuth();
  const { status, scannedCount, matchedUsers, setStatus, processUsers } =
    useScan();
  const webviewRef = useRef<WebView>(null);

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      if (!agent) return;

      const message = parseExtractedUsers(event.nativeEvent.data);
      if (!message) return;

      if (message.type === "users") {
        await processUsers(message.payload, agent);
      } else if (message.type === "scroll_end") {
        setStatus("completed");
      }
    },
    [agent, processUsers, setStatus],
  );

  const handleStop = () => {
    webviewRef.current?.injectJavaScript(
      'window.postMessage(JSON.stringify({type:"stop_scan"})); true;',
    );
    setStatus("completed");
  };

  const handleViewResults = () => {
    router.push("/results");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {status === "completed" ? "Scan Complete" : "Scanning..."}
        </Text>

        {status !== "completed" && (
          <ActivityIndicator
            size="small"
            color="#0085FF"
            style={styles.spinner}
          />
        )}

        <ScanProgress
          scannedCount={scannedCount}
          matchedCount={matchedUsers.length}
        />

        {status === "completed" ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleViewResults}
          >
            <Text style={styles.buttonText}>
              View {matchedUsers.length} matched users
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStop}
          >
            <Text style={styles.buttonText}>Stop Scanning</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Off-screen WebView for scraping */}
      <View style={styles.offscreen}>
        <WebView
          ref={webviewRef}
          source={{ uri: X_FOLLOW_PAGE_URL }}
          injectedJavaScript={buildScrapeScript()}
          onMessage={handleMessage}
          onLoadStart={() => setStatus("scanning")}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  spinner: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#0085FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  stopButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  offscreen: {
    position: "absolute",
    left: -9999,
    width: 1,
    height: 1,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add mobile/components/ScanProgress.tsx mobile/app/scan.tsx
git commit -m "feat(mobile): implement scan screen with off-screen WebView scraping"
```

---

### Task 15: Results Screen with UserCard

**Files:**
- Create: `mobile/components/UserCard.tsx`
- Create: `mobile/app/results.tsx`

- [ ] **Step 1: Create UserCard component**

Create `mobile/components/UserCard.tsx`:

```tsx
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { BskyUser } from "~/types";

type Props = {
  user: BskyUser;
  onFollow: (user: BskyUser) => Promise<void>;
};

const MATCH_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  handle: { label: "Handle match", color: "#3B82F6" },
  display_name: { label: "Display name", color: "#F59E0B" },
  description: { label: "Bio match", color: "#8B5CF6" },
};

export function UserCard({ user, onFollow }: Props) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const matchInfo = MATCH_TYPE_LABELS[user.matchType];

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await onFollow(user);
      setIsFollowing(true);
    } catch (e) {
      console.error("Follow error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarRow}>
        {user.originalAvatar ? (
          <Image source={{ uri: user.originalAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}
        <Text style={styles.arrow}>→</Text>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.displayName} numberOfLines={1}>
          {user.displayName || user.handle}
        </Text>
        <Text style={styles.handle} numberOfLines={1}>
          @{user.handle}
        </Text>
        {matchInfo && (
          <View
            style={[styles.badge, { backgroundColor: matchInfo.color + "20" }]}
          >
            <Text style={[styles.badgeText, { color: matchInfo.color }]}>
              {matchInfo.label}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.followButton,
          isFollowing && styles.followingButton,
          isLoading && styles.loadingButton,
        ]}
        onPress={handleFollow}
        disabled={isFollowing || isLoading}
      >
        <Text
          style={[
            styles.followButtonText,
            isFollowing && styles.followingButtonText,
          ]}
        >
          {isFollowing ? "Following" : isLoading ? "..." : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: "#ddd",
  },
  arrow: {
    marginHorizontal: 4,
    color: "#999",
    fontSize: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  displayName: {
    fontSize: 15,
    fontWeight: "600",
  },
  handle: {
    fontSize: 13,
    color: "#666",
    marginTop: 1,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  followButton: {
    backgroundColor: "#0085FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: "#f0f0f0",
  },
  loadingButton: {
    opacity: 0.6,
  },
  followButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  followingButtonText: {
    color: "#666",
  },
});
```

- [ ] **Step 2: Implement Results screen**

Create `mobile/app/results.tsx`:

```tsx
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UserCard } from "~/components/UserCard";
import { useAuth } from "~/contexts/AuthContext";
import { useScan } from "~/contexts/ScanContext";
import type { BskyUser } from "~/types";

export default function ResultsScreen() {
  const router = useRouter();
  const { agent } = useAuth();
  const { matchedUsers, reset } = useScan();

  const handleFollow = useCallback(
    async (user: BskyUser) => {
      if (!agent) return;
      await agent.follow(user.did);
    },
    [agent],
  );

  const handleScanAgain = () => {
    reset();
    router.replace("/x-login-guide");
  };

  const renderItem = useCallback(
    ({ item }: { item: BskyUser }) => (
      <UserCard user={item} onFollow={handleFollow} />
    ),
    [handleFollow],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {matchedUsers.length} users found
        </Text>
      </View>

      <FlatList
        data={matchedUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.did}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No matching users found</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleScanAgain}>
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 24,
    paddingBottom: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  list: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    backgroundColor: "#0085FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add mobile/components/UserCard.tsx mobile/app/results.tsx
git commit -m "feat(mobile): implement results screen with UserCard and follow action"
```

---

### Task 16: Server OAuth Changes for Mobile

**Files:**
- Modify: `server/wrangler.toml`
- Modify: `server/src/index.tsx`

- [ ] **Step 1: Add mobile redirect URI to wrangler.toml**

In `server/wrangler.toml`, update the `OAUTH_EXTENSION_REDIRECT_URIS` line to append the mobile deep link:

```toml
OAUTH_EXTENSION_REDIRECT_URIS = "https://behhbpbpmailcnfbjagknjngnfdojpko.chromiumapp.org/oauth-success,https://jmbbljkmlomkcbikmliioecjbijopigk.chromiumapp.org/oauth-success,https://76121d9d3ae7660b6c925ec7d15ee3ac5e683cd2.extensions.allizom.org/oauth-success,sky-follower-bridge://oauth-callback"
```

- [ ] **Step 2: Update OAuth client metadata to support native application type**

In `server/src/index.tsx`, the `/oauth/client-metadata.json` endpoint currently returns `application_type: "web"`. The mobile redirect URI uses a custom scheme (`sky-follower-bridge://`), which is compatible with the existing implementation since redirect URIs are dynamically built from `OAUTH_EXTENSION_REDIRECT_URIS`. No code change needed — the existing logic handles this correctly.

Verify by checking that the redirect URI list in the response includes the mobile URI.

- [ ] **Step 3: Commit**

```bash
git add server/wrangler.toml
git commit -m "feat(server): add mobile deep link to OAuth redirect URIs"
```

---

### Task 17: Mobile OAuth Implementation

**Files:**
- Create: `mobile/lib/bskyOAuth.ts`
- Modify: `mobile/contexts/AuthContext.tsx`

- [ ] **Step 1: Implement OAuth via expo-auth-session**

Create `mobile/lib/bskyOAuth.ts`:

```typescript
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { AtpAgent } from "@atproto/api";
import {
  BSKY_DOMAIN,
  BSKY_OAUTH_CLIENT_ID,
  BSKY_OAUTH_REDIRECT_URI,
  BSKY_OAUTH_SCOPE,
} from "./constants";

WebBrowser.maybeCompleteAuthSession();

const MOBILE_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "sky-follower-bridge",
  path: "oauth-callback",
});

// Build the callback URI that the server will redirect to
function buildServerCallbackUri(): string {
  const url = new URL(BSKY_OAUTH_REDIRECT_URI);
  url.searchParams.set("redirect_uri", MOBILE_REDIRECT_URI);
  return url.toString();
}

export async function resolveAuthorizationServer(
  identifier: string,
): Promise<string> {
  // Resolve the user's PDS and get its authorization server
  const agent = new AtpAgent({ service: `https://${BSKY_DOMAIN}` });
  try {
    const did = identifier.startsWith("did:")
      ? identifier
      : (await agent.resolveHandle({ handle: identifier })).data.did;

    // Get PDS endpoint from DID document
    const didDoc = await fetch(
      did.startsWith("did:web:")
        ? `https://${did.replace("did:web:", "")}/.well-known/did.json`
        : `https://plc.directory/${did}`,
    );
    const doc = await didDoc.json();
    const pdsEndpoint =
      doc.service?.find(
        (s: { id: string }) => s.id === "#atproto_pds",
      )?.serviceEndpoint || `https://${BSKY_DOMAIN}`;

    // Get authorization server from PDS's protected resource metadata
    const prm = await fetch(
      `${pdsEndpoint}/.well-known/oauth-protected-resource`,
    );
    const prmData = await prm.json();
    return prmData.authorization_servers?.[0] || `https://${BSKY_DOMAIN}`;
  } catch {
    return `https://${BSKY_DOMAIN}`;
  }
}

export async function loginWithOAuth(identifier: string): Promise<{
  agent: AtpAgent;
  sub: string;
}> {
  const authServer = await resolveAuthorizationServer(identifier);

  // Fetch authorization server metadata
  const asMeta = await fetch(
    `${authServer}/.well-known/oauth-authorization-server`,
  );
  const asMetaData = await asMeta.json();

  const discovery: AuthSession.DiscoveryDocument = {
    authorizationEndpoint: asMetaData.authorization_endpoint,
    tokenEndpoint: asMetaData.token_endpoint,
  };

  const redirectUri = buildServerCallbackUri();

  const request = new AuthSession.AuthRequest({
    clientId: BSKY_OAUTH_CLIENT_ID,
    scopes: [BSKY_OAUTH_SCOPE],
    redirectUri,
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
  });

  const result = await request.promptAsync(discovery);

  if (result.type !== "success" || !result.params.code) {
    throw new Error(
      result.type === "error"
        ? result.params.error_description || "OAuth failed"
        : "OAuth cancelled",
    );
  }

  // Exchange code for tokens
  const tokenResult = await AuthSession.exchangeCodeAsync(
    {
      clientId: BSKY_OAUTH_CLIENT_ID,
      code: result.params.code,
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier || "",
      },
    },
    discovery,
  );

  // Create agent with the access token
  const agent = new AtpAgent({ service: authServer });
  // Resume session with the token
  // Note: This is a simplified flow — full DPoP support may require
  // additional implementation for production use
  await agent.resumeSession({
    did: tokenResult.idToken ? JSON.parse(atob(tokenResult.idToken.split(".")[1])).sub : "",
    handle: identifier,
    accessJwt: tokenResult.accessToken,
    refreshJwt: tokenResult.refreshToken || "",
    active: true,
  });

  return {
    agent,
    sub: agent.session?.did || "",
  };
}
```

- [ ] **Step 2: Add OAuth login to AuthContext**

Update `mobile/contexts/AuthContext.tsx` — add the `loginWithOAuth` import and method:

Add import at top:
```typescript
import { loginWithOAuth } from "~/lib/bskyOAuth";
```

Add to AuthState type:
```typescript
loginWithOAuth: (identifier: string) => Promise<void>;
```

Add method in AuthProvider:
```typescript
const handleOAuthLogin = useCallback(async (identifier: string) => {
  const { agent: newAgent, sub } = await loginWithOAuth(identifier);
  const sessionData: SessionData = { authMethod: "oauth", sub };
  await saveSession(sessionData);
  setAgent(newAgent);
  setHandle(newAgent.session?.handle ?? null);
}, []);
```

Add to provider value:
```typescript
loginWithOAuth: handleOAuthLogin,
```

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/bskyOAuth.ts mobile/contexts/AuthContext.tsx
git commit -m "feat(mobile): implement OAuth login via expo-auth-session"
```

---

### Task 18: End-to-End Smoke Test

**Files:** None (manual testing)

- [ ] **Step 1: Start the development server**

```bash
cd mobile && npx expo start --dev-client
```

- [ ] **Step 2: Test full flow on iOS simulator or device**

1. App opens → Welcome screen displays
2. Tap "Get Started" → Auth screen
3. Enter Bluesky credentials → Login succeeds → X Login Guide
4. Tap "Open X Login" → WebView shows X login
5. Login to X → Auto-redirect to Scan screen
6. WebView scrapes followers → Progress updates in real-time
7. Scan completes → Tap "View matched users"
8. Results screen shows matched users with Follow buttons
9. Tap Follow → User is followed on Bluesky

- [ ] **Step 3: Run all tests**

```bash
cd mobile && npx vitest run
```

Expected: All tests pass.

- [ ] **Step 4: Commit any fixes from smoke test**

```bash
git add -A mobile/
git commit -m "fix(mobile): address issues found during smoke testing"
```
