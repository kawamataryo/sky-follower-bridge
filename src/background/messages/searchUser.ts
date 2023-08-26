import type { PlasmoMessaging } from "@plasmohq/messaging"
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session, term, limit }  = req.body
  const client = BskyClient.createAgentFromSession(session)

  res.send({
    actors: await client.searchUser({
      term,
      limit,
    })
  })
}

export default handler
