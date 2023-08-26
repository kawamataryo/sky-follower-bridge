import type { PlasmoMessaging } from "@plasmohq/messaging"
import { BskyClient } from "~lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { session, subjectDid }  = req.body
  const client = BskyClient.createAgentFromSession(session)

  res.send({
    result: await client.follow(subjectDid)
  })
}

export default handler
