# Sky Follower Bridge Mobile App Design

## Overview

React Native (Expo) mobile app that brings Sky Follower Bridge's functionality to mobile users. Uses WebView to load X (Twitter) and scrape follower data, matching users with Bluesky accounts using the same fuzzy search algorithm as the Chrome extension.

**Scope (MVP)**:
- X (Twitter) only (no Threads/Instagram/TikTok/Facebook)
- Follow operation only (no block/list import)
- iOS + Android simultaneously
- Minimal filtering (All / Matched only)

## Architecture

```
┌─────────────────────────────────────────────┐
│              React Native App                │
│                                              │
│  ┌──────────────┐    ┌───────────────────┐  │
│  │  Native UI    │    │  WebView (X.com)  │  │
│  │              │    │                   │  │
│  │ - Auth Screen │    │ - Login Phase:    │  │
│  │ - Scan Screen │◄──►│   Full screen     │  │
│  │ - Results     │    │ - Scan Phase:     │  │
│  │ - User Cards  │    │   Off-screen      │  │
│  └──────┬───────┘    └───────┬───────────┘  │
│         │                    │               │
│         │   postMessage /    │               │
│         │◄── onMessage ──────┘               │
│         │                                    │
│  ┌──────▼───────────────────────────────┐   │
│  │        Bluesky API Layer             │   │
│  │  @atproto/api (AtpAgent)             │   │
│  │  OAuth: expo-auth-session            │   │
│  │  Storage: expo-secure-store          │   │
│  └──────────────┬───────────────────────┘   │
└─────────────────┼───────────────────────────┘
                  │
    ┌─────────────▼──────────────┐
    │  Cloudflare Workers Server  │
    │  - OAuth client metadata    │
    │  - OAuth callback (existing)│
    │  + Mobile redirect support  │
    │  - Image CORS proxy (exist) │
    └────────────────────────────┘
```

**Key difference from Chrome extension**: No Service Worker message passing needed. The app calls `@atproto/api` directly, making the architecture simpler.

## Screen Flow

```
[1. Welcome Screen]
    │
    ▼
[2. Bluesky Auth Screen]  ── OAuth → System Browser → Callback → App
    │                      └─ App Password → Direct login
    ▼
[3. X Login Guide Screen]  ── Explains why X login is needed
    │
    ▼
[4. X WebView Screen]  ── Full screen WebView showing X login page
    │                      Detects login completion via URL change
    ▼
[5. Scan Screen]  ── WebView moved off-screen, auto-navigates to x.com/following
    │                 Native progress UI: "Scanned: 42 / Matched: 5"
    │                 Stop button
    ▼
[6. Results Screen]  ── Matched user list (card format)
                        "Follow" button per card
                        Filter: All / Matched only
```

### Screen Details

- **Screen 1-2**: Standard native screens. Bluesky OAuth opens system browser via `expo-auth-session`
- **Screen 3**: Static explanation screen with illustration/text. "Start" button proceeds
- **Screen 4**: `react-native-webview` showing `https://x.com/login`. Monitors URL via `onNavigationStateChange` to detect login completion
- **Screen 5**: WebView positioned off-screen (`position: absolute, left: -9999`). `injectedJavaScript` runs scraping + auto-scroll. Results sent via `postMessage`
- **Screen 6**: FlatList displaying matched users with follow actions

**Navigation**: Expo Router (file-based routing)

## WebView Scraping Engine

The core technical mechanism. Injects JavaScript into the WebView to extract user data from X's DOM, identical to the Chrome extension's content script approach.

```
WebView (X.com/following)
    │
    │  injectedJavaScript:
    │  1. Query [data-testid="UserCell"] elements
    │  2. Extract accountName (href), displayName (text), description
    │  3. Auto-scroll to load more
    │  4. Send via postMessage
    │
    ▼
React Native (onMessage)
    │  For each user batch:
    │  1. searchActors via @atproto/api
    │  2. fuzzySearch match
    │  3. Add to state → UI updates
```

### Differences from Chrome Extension

| Aspect | Chrome Extension | Mobile |
|--------|-----------------|--------|
| JS injection | Content script (auto) | `injectedJavaScript` (manual) |
| Communication | `chrome.runtime.sendMessage` | `postMessage` / `onMessage` |
| Avatar | Base64 via canvas | **URL only** (fetch via CORS proxy later) |
| Scroll | `document.documentElement.scrollTo` | Same (inside injected JS) |
| Deduplication | `Set<HTMLElement>` | **`Set<accountName>`** (no element refs across boundary) |

### Design Decisions

1. **Avatars as URLs only**: No canvas-based Base64 conversion in WebView. Send avatar URLs, display with `expo-image`, and use server CORS proxy for image similarity scoring
2. **accountName-based deduplication**: Cannot pass DOM element references across WebView-Native boundary
3. **Batch sending**: Send users per scroll batch (not individually) to reduce communication overhead
4. **Scroll end detection**: Same as Chrome extension (scrollTop + clientHeight >= scrollHeight checked twice, 8s interval)

### Message Protocol (WebView <-> Native)

```typescript
// WebView → Native
{ type: "users", payload: CrawledUser[] }      // User batch
{ type: "scroll_end" }                          // Scroll complete
{ type: "login_detected", url: string }         // X login detected
{ type: "error", message: string }              // Error

// Native → WebView (injectJavaScript)
{ type: "start_scan" }                          // Start scanning
{ type: "stop_scan" }                           // Stop scanning
{ type: "navigate", url: string }               // Navigate to URL
```

## Bluesky Authentication

### OAuth Flow (Primary)

```
App → expo-auth-session → System Browser
  → Bluesky Authorization Server
  → Server callback (/oauth/callback)
  → Deep Link (myapp://oauth-callback)
  → App establishes session
```

| Aspect | Chrome Extension | Mobile |
|--------|-----------------|--------|
| OAuth launch | `chrome.identity.launchWebAuthFlow` | `expo-auth-session` (system browser) |
| Redirect URI | `chromiumapp.org/oauth-success` | `myapp://oauth-callback` |
| Session storage | IndexedDB | `expo-secure-store` (Keychain/Keystore) |
| DPoP key mgmt | Web Crypto API | `expo-crypto` |
| Token refresh | Service Worker auto | `@atproto/api` SessionManager in-app |

### Server-side Changes Required

1. Add mobile redirect URI to OAuth client metadata
2. Add mobile deep link redirect to OAuth callback handler
3. Update `wrangler.toml` allowed redirect URI list

```jsonc
// client-metadata.json addition
{
  "redirect_uris": [
    "https://server.sky-follower-bridge.dev/oauth/callback", // existing
    "myapp://oauth-callback"  // mobile addition
  ]
}
```

### App Password Flow (Secondary)

Same as Chrome extension. `AtpAgent.login({ identifier, password })` directly. Session stored in `expo-secure-store`. No server changes needed.

### Session Storage

```typescript
// expo-secure-store
{
  authMethod: "oauth" | "app-password",
  session: string  // OAuth: sub (DID), App Password: AtpSessionData JSON
}
```

On app launch, attempt to restore saved session. Skip auth screen if valid.

## State Management

React Context (no external library needed for MVP).

```
┌─ AuthContext ─────────────────────────────┐
│  agent: AtpAgent | null                    │
│  session: SessionData | null               │
│  login() / logout()                        │
└────────────────────────────────────────────┘

┌─ ScanContext ──────────────────────────────┐
│  status: "idle" | "logging_in" | "scanning"│
│          | "completed" | "error"           │
│  scannedCount: number                      │
│  matchedUsers: MatchedUser[]               │
│  addUsers() / stop() / reset()             │
└────────────────────────────────────────────┘
```

### Scan Data Flow

```
WebView (injectedJS)
  │ postMessage({ type: "users", payload: CrawledUser[] })
  ▼
onMessage handler
  │ Batch received → update scannedCount
  ▼
matchUsers() ── parallel processing (10 at a time, 300ms delay)
  │ 1. agent.searchActors(searchTerm)
  │ 2. isSimilarUser() match check
  │ 3. Add matched users to matchedUsers
  ▼
Results Screen (FlatList)
  │ Observes matchedUsers for real-time rendering
```

## Project Structure

```
mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout + Context providers
│   ├── index.tsx                  # Welcome screen
│   ├── auth.tsx                   # Bluesky auth screen
│   ├── x-login-guide.tsx          # X login guide screen
│   ├── x-login.tsx                # X WebView (login phase)
│   ├── scan.tsx                   # Scan progress screen
│   └── results.tsx                # Results screen
├── components/
│   ├── UserCard.tsx               # Matched user card
│   └── ScanProgress.tsx           # Scan progress display
├── contexts/
│   ├── AuthContext.tsx             # Bluesky auth state
│   └── ScanContext.tsx             # Scan state
├── lib/
│   ├── bskyAgent.ts               # AtpAgent wrapper
│   ├── bskyOAuth.ts               # OAuth (expo-auth-session)
│   ├── fuzzySearch.ts             # Matching algorithm (ported)
│   ├── bskyHelpers.ts             # Helpers (ported)
│   └── webviewScripts.ts          # WebView injection JS code
├── services/
│   └── xScraper.ts                # X DOM scraping logic
├── types/
│   └── index.ts                   # Type definitions
├── app.json                       # Expo config
├── package.json
└── tsconfig.json
```

## Dependencies

```
expo, expo-router, expo-auth-session, expo-secure-store, expo-crypto
react-native-webview
@atproto/api
jaro-winkler
```

## Testing Strategy

- **Vitest** (same as Chrome extension)
- Focus on logic layer:
  - `fuzzySearch.ts` — matching logic (tests portable from Chrome extension)
  - `xScraper.ts` — DOM extraction logic (unit tests with HTML snippets)
  - `webviewScripts.ts` — injection JS generation correctness
- WebView / navigation E2E tests out of initial scope

## Code Sharing Policy

No code sharing with Chrome extension. The following logic is **ported (copy + adapt)**:
- `fuzzySearchBskyUser.ts` → `lib/fuzzySearch.ts`
- `bskyHelpers.ts` → `lib/bskyHelpers.ts`
- `xService.ts` DOM selectors/extraction → `services/xScraper.ts` + `lib/webviewScripts.ts`
