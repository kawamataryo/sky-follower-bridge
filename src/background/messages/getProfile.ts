import type { PlasmoMessaging } from "@plasmohq/messaging";
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session, actor } = req.body;

  try {
    const client = await BskyClient.createAgentFromSession(session);
    res.send({
      result: await client.getProfile(actor),
    });
  } catch (e) {
    res.send({
      error: {
        message: e instanceof Error ? e.message : String(e),
      },
    });
  }
};

export default handler;
