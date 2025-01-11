import type { PlasmoMessaging } from "@plasmohq/messaging";
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session, blockUri } = req.body;
  try {
    const client = await BskyClient.createAgentFromSession(session);
    res.send({
      result: await client.unblock(blockUri),
    });
  } catch (e) {
    res.send({
      error: {
        message: e.message,
      },
    });
  }
};

export default handler;
