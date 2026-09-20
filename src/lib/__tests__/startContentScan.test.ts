import { afterEach, expect, it, vi } from "vitest";
import { MESSAGE_NAMES } from "../constants";
import { startContentScan } from "../startContentScan";

afterEach(() => vi.unstubAllGlobals());

it("starts scanning in the selected tab's top frame without broadcasting to Instagram iframes", async () => {
  const sendMessage = vi.fn(async (_tab, _message, options) =>
    options?.frameId === 0
      ? { hasError: false }
      : {
          hasError: true,
          message: "Please open the Following or Followers list",
        },
  );
  vi.stubGlobal("chrome", { tabs: { sendMessage } });
  const name = MESSAGE_NAMES.SEARCH_BSKY_USER_ON_INSTAGRAM_PAGE;
  await expect(startContentScan(42, name)).resolves.toEqual({
    hasError: false,
  });
  expect(sendMessage).toHaveBeenCalledExactlyOnceWith(
    42,
    { name },
    { frameId: 0 },
  );
});
