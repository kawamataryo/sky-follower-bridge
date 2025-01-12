import type { PlasmoMessaging } from "@plasmohq/messaging";
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session } = req.body;
  try {
    const client = await BskyClient.createAgentFromSession(session);
    const result = await client.getMyProfile();
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
