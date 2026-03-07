import type { PlasmoMessaging } from "@plasmohq/messaging";
import { logoutOAuthSession } from "~lib/bskyOAuthClient";

const handler: PlasmoMessaging.MessageHandler = async (_req, res) => {
  try {
    await logoutOAuthSession();
    res.send({ result: true });
  } catch (e) {
    res.send({
      error: {
        message: e.message,
      },
    });
  }
};

export default handler;
