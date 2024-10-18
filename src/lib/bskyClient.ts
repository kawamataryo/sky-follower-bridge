import { AtUri, AtpAgent, type AtpSessionData } from "@atproto/api";

// try and cut down the amount of session resumes by caching the clients
const clientCache = new Map<string, BskyClient>();

export type BskyLoginParams = {
  identifier: string;
  password: string;
  authFactorToken?: string;
};

export class BskyClient {
  private service = "https://bsky.social";
  me: {
    did: string;
    handle: string;
    email: string;
  };
  agent: AtpAgent;
  session = {};

  private constructor() {
    this.agent = new AtpAgent({
      service: this.service,
      persistSession: (evt, session) => {
        this.session = session;
      },
    });
  }

  public static async createAgentFromSession(
    session: AtpSessionData,
  ): Promise<BskyClient> {
    if (clientCache.has(session.did)) {
      return clientCache.get(session.did);
    }
    const client = new BskyClient();
    await client.agent.resumeSession(session);
    client.me = {
      did: session.did,
      handle: session.handle,
      email: session.email,
    };

    clientCache.set(session.did, client);

    return client;
  }

  public static async createAgent({
    identifier,
    password,
    authFactorToken,
  }: BskyLoginParams): Promise<BskyClient> {
    const client = new BskyClient();
    const { data } = await client.agent.login({
      identifier,
      password,
      ...(authFactorToken && { authFactorToken }),
    });
    client.me = {
      did: data.did,
      handle: data.handle,
      email: data.email,
    };

    clientCache.set(data.did, client);

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
