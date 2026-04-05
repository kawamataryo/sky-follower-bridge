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

      window.addEventListener('message', function(event) {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'start_scan') run();
          if (msg.type === 'stop_scan') stop();
        } catch(e) {}
      });

      run();

      true;
    })();
  `;
}

export function buildNavigateScript(url: string): string {
  return `window.location.href = '${url}'; true;`;
}
