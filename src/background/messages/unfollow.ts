import type { PlasmoMessaging } from "@plasmohq/messaging"
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session, followUri } = req.body
  const client = BskyClient.createAgentFromSession(session)

  try {
    res.send({
      result: await client.unfollow(followUri)
    })
  } catch (e) {
    res.send({
      error: {
        message: e.message,
      }
    })
  }
}

export default handler
