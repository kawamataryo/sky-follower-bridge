import { render } from "vitest-browser-react";
import { test, expect, vi, describe, beforeEach } from "vitest";
import IndexPopup from "./popup.tsx";
import { STORAGE_KEYS } from "./lib/constants";

// Chrome Storage APIのモックを作成
const mockChromeStorage = {
  local: {
    get: vi.fn((keys, callback) => {
      callback({
        // デフォルトの戻り値を設定
        [STORAGE_KEYS.BSKY_USER_ID]: "",
        [STORAGE_KEYS.BSKY_PASSWORD]: "",
        [STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT]: false,
      });
    }),
    set: vi.fn(),
  },
};

window.chrome = {
  storage: mockChromeStorage,
  tabs: {
    query: vi
      .fn()
      .mockResolvedValue([{ id: 1, url: "https://x.com/xxx/following" }]),
    reload: vi.fn(),
  },
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
} as any;

describe("IndexPopup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads credentials from storage on mount", async () => {
    mockChromeStorage.local.get.mockImplementation((keys, callback) => {
      callback({
        [STORAGE_KEYS.BSKY_USER_ID]: "testuser",
        [STORAGE_KEYS.BSKY_PASSWORD]: "testpass",
        [STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT]: false,
      });
    });

    const screen = render(<IndexPopup />);

    expect(mockChromeStorage.local.get).toHaveBeenCalledWith(
      [
        STORAGE_KEYS.BSKY_USER_ID,
        STORAGE_KEYS.BSKY_PASSWORD,
        STORAGE_KEYS.BSKY_SHOW_AUTH_FACTOR_TOKEN_INPUT,
      ],
      expect.any(Function),
    );

    const identifierInput = screen.getByTestId("identifier");
    const passwordInput = screen.getByTestId("password");

    expect.element(identifierInput).toHaveValue("testuser");
    expect.element(passwordInput).toHaveValue("testpass");
  });

  test("show error message when form is invalid", async () => {
    const screen = render(<IndexPopup />);

    const submitButton = screen.getByText("Find Bluesky Users");
    submitButton.click();
  });
});
