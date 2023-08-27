import type { PlasmoMessaging } from "@plasmohq/messaging"
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session, term, limit } = req.body
  const client = BskyClient.createAgentFromSession(session)

  try {
    res.send({
      actors: await client.searchUser({
        term,
        limit,
      })
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
