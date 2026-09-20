# Chrome extension verification with Computer Use

Use this guide when an agent verifies Sky Follower Bridge in a user's existing
Chrome session, especially after changing Instagram extraction. Read the current
Computer Use skill supplied by your agent environment first; its API and approval
rules take precedence over the examples here. If the user explicitly requests
Computer Use, use that surface for UI actions.

## Prepare the build actually loaded by Chrome

1. Review the checkout diff and preserve unrelated changes. Run:
   ```sh
   npm test -- --run
   npm run check:ci
   npm run build
   ```
2. In Chrome, open `chrome://extensions`, locate Sky Follower Bridge, and open
   Details. Confirm the installed version and the unpacked source directory.
   A worktree's `build/chrome-mv3-prod` may differ from the directory Chrome uses.
3. For an existing unpacked development installation, back up its build directory
   outside Git, then copy the newly built directory contents to that exact path.
   Follow environment filesystem permissions. Do not overwrite a guessed path.
   Installing a new extension is a separate action subject to the active skill's
   confirmation rules.
4. Click the extension's Reload button. Reload the Instagram tab too, to replace
   old content scripts. Open the toolbar popup and verify its version. Version
   alone is insufficient when rebuilding the same patch version: also verify the
   behavior changed. Store installation/version and local builds are distinct;
   local success does not mean a release has been published.

## Operate and observe

With the Computer Use skill loaded, a typical setup is:

```js
var sky = (await import('@oai/sky')).sky;
var state = await sky.get_app_state({app: '/Applications/Google Chrome.app'});
nodeRepl.write(state.text);
```

Use fresh accessibility element indices to click. After actions, fetch state again
before selecting the next control. Do not reuse old indices after a navigation or
popup change. When the accessibility tree is incomplete, inspect the screenshot
returned by the same tool and use coordinates grounded in that screenshot.

```js
var fs = await import('node:fs/promises');
if (state.screenshot) {
  await nodeRepl.emitImage({
    bytes: await fs.readFile(new URL(state.screenshot.url)),
    mimeType: 'image/jpeg'
  });
}
```

The accessibility tree can expose hidden extension UI (for example, `Scanning 0 X
users` before any scan) or omit the visible scan modal behind Instagram's dialog.
Confirm contradictory state with a screenshot. Open the real toolbar popup while
Instagram is active; opening `popup.html` in a regular tab does not reproduce
active-tab detection.

If Chrome returns only a window title, a tiny unrelated subtree, or no screenshot,
request fresh full state once (`disableDiff: true`). If the user changes the app,
refresh state before further actions. Follow skill troubleshooting for app
selection. Do not infer success from missing UI, click blindly, or repeatedly
retry without new evidence. Report the exact unverified step if access remains
unavailable. Never substitute another browser without honoring the user's chosen
surface and its login state.

## Instagram scenarios

Use the authorized account already signed in. If authentication is required, let
the user complete it. Do not follow/unfollow, post, or share as part of scan QA.

1. Open the profile and its Following list. Wait for actual account rows.
   The URL may stay at `/username/`; this is expected.
2. Include a Japanese-language case (`?hl=ja`). Profile links inside the list may
   also have query parameters. Include dotted/underscored names and a verified
   badge when the account data permits.
3. Record the profile's list count. Open the extension toolbar popup and click
   Find Bluesky Users. Confirm there is no simultaneous red error in the popup.
4. Check the **Scanning N Instagram users** count becomes nonzero and matches the
   intended relationship list. Accounts under Suggested must not be included.
   **Found M** is a separate candidate count and can legitimately be zero.
5. Wait for scanning to finish. Confirm the loading UI disappears and View
   Detected Users is shown. Open it and inspect source/candidate rows without
   clicking Follow. A handle match is not proof of the same person.
6. Repeat with Followers and enough entries to require scrolling. Verify newly
   loaded rows are processed and the count reaches the list total without
   duplicates or an endless spinner.
7. With no relationship list open, Find should show the localized instruction to
   open Following or Followers, rather than start a zero-user scan.

## Evidence and diagnosis

Record build/version, browser, list type, query-language case, scan count,
candidate count, completion, and whether the result page opened. Keep private
screenshots/account information out of public PRs unless explicitly authorized.
Distinguish live extension tests, DOM-only checks, unit tests, and untested cases.

Useful failure distinctions:

- Invalid active page: check profile URL acceptance and whether a list is open.
- Scan starts with a red error: inspect message routing; only frame 0 should
  receive the start message, so embedded frames cannot return a conflicting reply.
- Scanning stays at zero: check actual profile hrefs, including `?hl=ja`, before
  blaming Bluesky matching. Query parameters must not invalidate a profile link.
- Count exceeds the relationship total: check whether Suggested accounts leaked
  into extraction.
- Count stops early: inspect list-scoped scrolling, newly loaded rows, spinners,
  and end detection.

For the September 2026 fix, live Chrome Computer Use verification covered a
Japanese Following list: 6 scanned, 2 candidates, completion and results page
confirmed. Followers (25 entries) was verified separately at the DOM extraction
level, not as a full live extension scan. Candidate identity was not verified.
