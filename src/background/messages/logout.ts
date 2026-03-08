import type { PlasmoMessaging } from "@plasmohq/messaging";
import { clearBskyClientCache } from "~lib/bskyClient";
import { logoutOAuthSession } from "~lib/bskyOAuthClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const authMethod = req.body?.authMethod;

  try {
    if (authMethod === "app-password") {
      clearBskyClientCache();
    } else {
      await logoutOAuthSession();
    }
    res.send({ result: true });
  } catch (e) {
    res.send({
      error: {
        message: e instanceof Error ? e.message : String(e),
      },
    });
  }
};

export default handler;
