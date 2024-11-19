import type { PlasmoMessaging } from "@plasmohq/messaging";
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session, userDid, listUri } = req.body;
  const client = await BskyClient.createAgentFromSession(session);

  try {
    res.send({
      result: await client.addUserToList({ userDid, listUri }),
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