import type { PlasmoMessaging } from "@plasmohq/messaging"
import { BskyClient } from "../../lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { identifier, password }  = req.body

  const agent = await BskyClient.createAgent({
    identifier,
    password,
  })

  res.send({
    session: agent.session,
  })
}

export default handler
