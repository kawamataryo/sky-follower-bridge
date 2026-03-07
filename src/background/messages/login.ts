import { Agent } from "@atproto/api";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { loginWithOAuth } from "~lib/bskyOAuthClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { identifier } = req.body;

  try {
    const session = await loginWithOAuth(identifier);
    const agent = new Agent(session as never);
    const profile = await agent.getProfile({
      actor: session.sub,
    });

    res.send({
      session: {
        sub: session.sub,
      },
      profile: {
        displayName: profile.data.displayName,
        avatar: profile.data.avatar,
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
