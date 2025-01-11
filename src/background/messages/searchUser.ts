import type { PlasmoMessaging } from "@plasmohq/messaging";
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session, term, limit } = req.body;
  try {
    const client = await BskyClient.createAgentFromSession(session);
    res.send({
      actors: await client.searchUser({
        term,
        limit,
      }),
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
