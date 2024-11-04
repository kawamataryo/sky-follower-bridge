import type { PlasmoMessaging } from "@plasmohq/messaging";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  chrome.runtime.openOptionsPage(() => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
};

export default handler;
