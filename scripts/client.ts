import { BskyClient } from "../src/lib/bskyClient"

const searchBskyUsers = async () => {
  const agent = await BskyClient.createAgent({
    identifier: process.env.BSKY_IDENTIFIER as string,
    password: process.env.BSKY_PASSWORD as string,
  })

  const result = await agent.searchUser({
    term: "llamaindex",
    limit: 3,
  })

  return result
}

(async () => {
  const result = await searchBskyUsers()
  console.log(result)
})()
