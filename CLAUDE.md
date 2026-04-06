# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sky Follower Bridge is a browser extension that helps users migrate their social connections from X (Twitter), Threads, Instagram, TikTok, and Facebook to Bluesky. It uses web scraping to detect users on these platforms and matches them with Bluesky accounts using fuzzy search algorithms.

**Tech Stack:**
- **Framework**: Plasmo (Manifest V3 browser extension framework)
- **Frontend**: React 18.2.0 + TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **Bluesky API**: @atproto/api
- **Testing**: Vitest + Happy DOM
- **Linting**: Biome
- **Backend**: Cloudflare Workers (Hono framework)

## Development Commands

```bash
# Development
npm run dev                  # Start development server (Chrome)
npm run dev:firefox          # Start development server (Firefox)

# Building
npm run build                # Build for Chrome (creates build/chrome-mv3-prod)
npm run build:firefox        # Build for Firefox
npm run package              # Package for Chrome distribution
npm run package:firefox      # Package for Firefox distribution

# Testing & Quality
npm run test                 # Run Vitest tests
npm run check                # Run Biome formatter/linter (auto-fix)
npm run check:ci             # CI check (no auto-fix)

# Component Development
npm run storybook            # Launch Storybook on port 6006
npm run build-storybook      # Build Storybook

# Documentation
npm run docs:dev             # Start VitePress dev server
npm run docs:build           # Build VitePress docs
npm run docs:preview         # Preview built docs
```

## Architecture

### High-Level Flow

```
User opens Extension (Alt+B)
    ↓
[Popup] Login to Bluesky → Start Search
    ↓
[Content Script] Detects current page → Scrapes users → Matches with Bluesky
    ↓
[Service Worker] Performs Bluesky API operations (follow/block/list)
    ↓
[Popup] Shows matched users in modal
```

### Core Components

1. **Popup** (`src/popup.tsx`): Main UI for authentication and search initiation
2. **Content Scripts** (`src/contents/`): Injected into target sites to scrape user data
3. **Service Worker** (`src/background/messages/`): Handles Bluesky API communication
4. **Services** (`src/services/`): Platform-specific scraping logic for X, Threads, Instagram, TikTok, Facebook

### Message Handlers (`src/background/messages/`)

All Bluesky API operations are handled via Plasmo message handlers:
- `login.ts`: Authenticate with Bluesky
- `follow.ts`, `unfollow.ts`: Follow/unfollow operations
- `block.ts`, `unblock.ts`: Block/unblock operations
- `searchUser.ts`: Search for users on Bluesky
- `createList.ts`, `addUserToList.ts`: List management
- `getMyProfile.ts`: Fetch authenticated user profile
- `getImageSimilarityScore.ts`: Calculate avatar similarity

### Platform Services (`src/services/`)

Each service implements the same interface for scraping user data:
- `xService.ts`: X.com (Twitter) following/followers/blocked pages
- `threadsService.ts`: Threads user lists
- `instagramService.ts`: Instagram followers/following
- `tikTokService.ts`: TikTok user lists
- `facebookService.ts`: Facebook friends

**Service Pattern:**
```typescript
class XService {
  extractUsersFromDom(): CrawledUserInfo[]
  observeDomChanges(callback: (users: CrawledUserInfo[]) => void): void
}
```

### User Matching Algorithm

Location: `src/lib/fuzzySearchBskyUser.ts`

Uses Jaro-Winkler algorithm to match scraped users with Bluesky accounts:
1. **Handle matching**: Exact or fuzzy match on username
2. **Display name matching**: Fuzzy match on display name
3. **Description matching**: Check if X/Threads handle appears in Bluesky bio
4. **Avatar similarity**: Calculate image similarity score (threshold: 0.6)

Match types are defined in `BSKY_USER_MATCH_TYPE` (handle, display_name, description, none).

### Constants (`src/lib/constants.ts`)

Critical configuration file containing:
- `TARGET_URLS_REGEX`: URL patterns that trigger the extension
- `MESSAGE_NAMES`: Inter-component communication message types
- `ACTION_MODE`: Follow, block, or import_list operations
- `STORAGE_KEYS`: Browser storage key prefixes
- `FILTER_TYPE`: User filtering criteria in results modal
- `BSKY_DOMAIN`: Configurable via `PLASMO_PUBLIC_BSKY_DOMAIN` env var

## Key Files to Understand

When working with this codebase, start with these files in order:

1. **`src/lib/constants.ts`**: All enums, regex patterns, and configuration
2. **`src/popup.tsx`**: Main user interface entry point
3. **`src/hooks/useSearch.ts`**: Search initialization logic
4. **`src/contents/App.tsx`**: Content script that coordinates scraping
5. **`src/lib/fuzzySearchBskyUser.ts`**: Core matching algorithm
6. **`src/background/messages/`**: Bluesky API operations

## Storage Architecture

Uses `@plasmohq/storage` for persistent data:
- `BSKY_CLIENT_SESSION`: Authenticated Bluesky session
- `DETECTED_BSKY_USERS`: Matched Bluesky users for current search
- `BSKY_MESSAGE_NAME`: Current operation mode (follow/block/list)
- `LIST_NAME`: Name for imported lists

## Multi-Platform Support

The extension detects the current page using `TARGET_URLS_REGEX` and instantiates the appropriate service:
- X.com: Follow, Followers, Blocked users, List members
- Threads: All pages
- Instagram: Followers/Following pages
- TikTok: User pages
- Facebook: Friends list

## Custom PDS Support

The extension can be built for custom Bluesky PDS servers:
```bash
PLASMO_PUBLIC_BSKY_DOMAIN=custom-domain.com npm run build
```

Default domain is `bsky.social` (defined in `src/lib/constants.ts`).

## Browser Extension Loading

**Chrome/Edge:**
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `build/chrome-mv3-prod`

**Firefox:**
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `.zip` file from `build/`

## Testing

- Tests are located alongside source files (e.g., `src/lib/__tests__/`)
- Run with `npm run test`
- Uses Vitest with Happy DOM for browser environment simulation

## Common Patterns

### Adding a New Platform Service

1. Create service file in `src/services/` (e.g., `newPlatformService.ts`)
2. Implement `extractUsersFromDom()` and `observeDomChanges()` methods
3. Add URL pattern to `TARGET_URLS_REGEX` in `src/lib/constants.ts`
4. Add message name to `MESSAGE_NAMES`
5. Update `src/contents/App.tsx` to instantiate the new service
6. Add host permission to `manifest.host_permissions` in `package.json`

### Adding a New Bluesky Operation

1. Create message handler in `src/background/messages/` (e.g., `newOperation.ts`)
2. Use `getBskyServiceWorkerClient()` from `src/lib/bskyServiceWorkerClient.ts`
3. Export handler using Plasmo's message handler pattern
4. Call from frontend using `@plasmohq/messaging`

## Internationalization

- Locale files in `locales/` directory (JSON format)
- Access translations via `chrome.i18n.getMessage(key)`
- Default locale: `en` (set in `package.json` manifest)
