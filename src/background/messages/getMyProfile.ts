import type { PlasmoMessaging } from "@plasmohq/messaging";
import destr from "destr";
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session } = req.body;
  try {
    const client = await BskyClient.createAgentFromSession(destr(session));
    res.send({
      result: JSON.stringify(await client.getMyProfile()),
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
