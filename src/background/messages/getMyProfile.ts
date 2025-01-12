import type { PlasmoMessaging } from "@plasmohq/messaging";
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session } = req.body;
  try {
    const client = await BskyClient.createAgentFromSession(session);
    const profile = await client.getMyProfile();
    res.send({
      result: {
        pdsUrl: profile.pdsUrl,
        did: profile.did,
        handle: profile.handle,
        displayName: profile.displayName,
        avatar: profile.avatar,
      },
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
