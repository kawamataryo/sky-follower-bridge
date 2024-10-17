import { AtUri, type AtpSessionData, BskyAgent } from "@atproto/api";

export type BskyLoginParams = {
  identifier: string;
  password: string;
};

export class BskyClient {
  private service = "https://bsky.social";
  // cached AppView API
  private publicApi = "https://public.api.bsky.app"
  me: {
    did: string;
    handle: string;
    email: string;
  };
  agent: BskyAgent;
  publicAgent: BskyAgent;
  session = {};

  private constructor() {
    this.agent = new BskyAgent({
      service: this.service,
      persistSession: (evt, session) => {
        this.session = session;
      },
    });
    this.publicAgent = new BskyAgent({
      service: this.publicApi
    });
  }

  public static createAgentFromSession(session: AtpSessionData): BskyClient {
    const client = new BskyClient();
    client.agent.resumeSession(session);
    client.me = {
      did: session.did,
      handle: session.handle,
      email: session.email,
    };

    return client;
  }

  public static async createAgent({
    identifier,
    password,
  }: BskyLoginParams): Promise<BskyClient> {
    const client = new BskyClient();
    const { data } = await client.agent.login({
      identifier,
      password,
    });
    client.me = {
      did: data.did,
      handle: data.handle,
      email: data.email,
    };
    return client;
  }

  public searchUser = async ({
    term,
    limit,
  }: {
    term: string;
    limit: number;
  }) => {
    const result = await this.publicAgent.searchActors({
      term,
      limit,
    });
    return result.data.actors;
  };

  public follow = async (subjectDid: string) => {
    return await this.agent.follow(subjectDid);
  };

  public unfollow = async (followUri: string) => {
    return await this.agent.deleteFollow(followUri);
  };

  public block = async (subjectDid: string) => {
    return await this.agent.app.bsky.graph.block.create(
      {
        repo: this.me.did,
        collection: "app.bsky.graph.block",
      },
      {
        subject: subjectDid,
        createdAt: new Date().toISOString(),
      },
    );
  };

  public unblock = async (blockUri: string) => {
    // TODO: unblock is not working. Need to fix it.
    const { rkey } = new AtUri(blockUri);
    return await this.agent.app.bsky.graph.block.delete({
      repo: this.me.did,
      collection: "app.bsky.graph.block",
      rkey,
    });
  };
}
