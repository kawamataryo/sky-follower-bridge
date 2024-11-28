import type { PlasmoMessaging } from "@plasmohq/messaging";
import { BskyClient } from "~lib/bskyClient";
import { STORAGE_KEYS } from "~lib/constants";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { name, description, userDids } = req.body;

  const storage = await chrome.storage.local.get(
    STORAGE_KEYS.BSKY_CLIENT_SESSION,
  );
  const session = storage[STORAGE_KEYS.BSKY_CLIENT_SESSION];

  if (!session || !session.did) {
    res.send({
      error: {
        message: "Invalid session data",
      },
    });
    return;
  }

  try {
    const client = await BskyClient.createAgentFromSession(session);
    await client.createListAndAddUsers({ name, description, userDids });
    res.send({ success: true });
  } catch (e) {
    res.send({
      error: {
        message: e.message,
      },
    });
  }
};

export default handler;
