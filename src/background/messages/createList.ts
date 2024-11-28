import type { PlasmoMessaging } from "@plasmohq/messaging";
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session, name, description } = req.body;
  const client = await BskyClient.createAgentFromSession(session);

  try {
    res.send({
      uri: await client.createList({ name, description }),
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
