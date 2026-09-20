import type { MessageName } from "../types";

/** Only the top document contains the relationship list selected by the user. */
export const startContentScan = (tabId: number, name: MessageName) =>
  chrome.tabs.sendMessage<
    { name: MessageName },
    { hasError: boolean; message?: string }
  >(tabId, { name }, { frameId: 0 });
