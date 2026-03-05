import { AtpAgent, type AtpSessionData, AtUri } from "@atproto/api";
import destr from "destr";
import { BSKY_DOMAIN } from "./constants";

// try and cut down the amount of session resumes by caching the clients
const clientCache = new Map<string, BskyClient>();

export type BskyStoredSession = AtpSessionData & {
  service?: string;
};

export type BskyLoginParams = {
  identifier: string;
  password: string;
  authFactorToken?: string;
  service?: string;
};

export class BskyClient {
  private service: string;
  me: {
    did: string;
    handle: string;
    email: string;
  };
  agent: AtpAgent;
  session = {} as BskyStoredSession;

  private static normalizeService(service?: string) {
    if (!service) {
      return `https://${BSKY_DOMAIN}`;
    }
    return service.startsWith("http") ? service : `https://${service}`;
  }

  private static getCacheKey({
    did,
    service,
  }: {
    did: string;
    service: string;
  }) {
    return `${service}::${did}`;
  }

  private constructor(service?: string) {
    this.service = BskyClient.normalizeService(service);
    this.agent = new AtpAgent({
      service: this.service,
      persistSession: (_evt, session) => {
        this.session = {
          ...session,
          service: this.service,
        };
      },
    });
  }

  public static async createAgentFromSession(
    session: BskyStoredSession,
  ): Promise<BskyClient> {
    const normalizedService = BskyClient.normalizeService(session.service);
    const cacheKey = BskyClient.getCacheKey({
      did: session.did,
      service: normalizedService,
    });

    let client = clientCache.get(cacheKey);

    if (!client) {
      client = new BskyClient(normalizedService);
      const parsedSession = destr<BskyStoredSession>(session);
      const { service: _service, ...atpSession } = parsedSession;
      await client.agent.resumeSession(atpSession);
      clientCache.set(cacheKey, client);
    }
    client.me = {
      did: session.did,
      handle: session.handle,
      email: session.email,
    };
    client.session = {
      ...session,
      service: normalizedService,
    };
    return client;
  }

  public static async createAgent({
    identifier,
    password,
    authFactorToken,
  }: BskyLoginParams): Promise<BskyClient> {
    const client = new BskyClient(service);
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

    client.session = {
      ...client.agent.session,
      service: client.service,
    };

    clientCache.set(
      BskyClient.getCacheKey({
        did: data.did,
        service: client.service,
      }),
      client,
    );

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

  public createList = async ({
    name,
    description,
  }: {
    name: string;
    description: string;
  }) => {
    const result = await this.agent.com.atproto.repo.createRecord({
      repo: this.me.did,
      collection: "app.bsky.graph.list",
      record: {
        $type: "app.bsky.graph.list",
        purpose: "app.bsky.graph.defs#curatelist",
        name,
        description,
        createdAt: new Date().toISOString(),
      },
    });
    return result.data.uri;
  };

  public addUserToList = async ({
    userDid,
    listUri,
  }: {
    userDid: string;
    listUri: string;
  }) => {
    return await this.agent.com.atproto.repo.createRecord({
      repo: this.me.did,
      collection: "app.bsky.graph.listitem",
      record: {
        $type: "app.bsky.graph.listitem",
        subject: userDid,
        list: listUri,
        createdAt: new Date().toISOString(),
      },
    });
  };

  public createListAndAddUsers = async ({
    name,
    description,
    userDids,
  }: {
    name: string;
    description: string;
    userDids: string[];
  }) => {
    const listUri = await this.createList({ name, description });
    for (const userDid of userDids) {
      await this.addUserToList({ userDid, listUri });
    }
  };

  public getMyProfile = async () => {
    const profile = await this.agent.getProfile({
      actor: this.agent.session.did,
    });
    return {
      pdsUrl: this.agent.pdsUrl,
      did: this.agent.session.did,
      handle: this.agent.session.handle,
      displayName: profile.data.displayName,
      avatar: profile.data.avatar,
    };
  };
}
