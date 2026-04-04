import { AtpAgent } from "@atproto/api";
import type { PlasmoMessaging } from "@plasmohq/messaging";

const agent = new AtpAgent({ service: "https://public.api.bsky.app" });

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { q, limit = 8 } = req.body;
  try {
    const { data } = await agent.app.bsky.actor.searchActorsTypeahead({
      q,
      limit,
    });
    res.send({ actors: data.actors });
  } catch (e) {
    res.send({
      error: {
        message: e.message,
      },
    });
  }
};

export default handler;
