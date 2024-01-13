import type { PlasmoMessaging } from "@plasmohq/messaging";
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session, subjectDid } = req.body;
  const client = BskyClient.createAgentFromSession(session);

  try {
    res.send({
      result: await client.block(subjectDid),
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
