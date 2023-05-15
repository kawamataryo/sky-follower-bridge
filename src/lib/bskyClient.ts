import { AppBskyFeedPost, AppBskyRichtextFacet, BskyAgent } from "@atproto/api";

export class BskyClient {
  private service = "https://bsky.social";
  agent: BskyAgent;
  private constructor() {
    this.agent = new BskyAgent({ service: this.service });
  }

  public static async createAgent({
    identifier,
    password,
  }: {
    identifier: string;
    password: string;
  }): Promise<BskyClient> {
    const client = new BskyClient();
    await client.agent.login({ identifier, password });
    return client;
  }

  public searchUser = async ({
    term,
    limit,
  }: {
    term: string;
    limit: number;
  }) => {
    const result = await this.agent.searchActors({
      term,
      limit,
    });
    return result.data.actors;
  };

  public follow = async (subjectDid: string) => {
    await this.agent.follow(subjectDid);
  }
}
