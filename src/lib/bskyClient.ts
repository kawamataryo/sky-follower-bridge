import { AtUri, AtpAgent, type AtpSessionData } from "@atproto/api";
import destr from "destr";
import { BSKY_DOMAIN } from "./constants";
import { debugLog } from "./utils";

// try and cut down the amount of session resumes by caching the clients
const clientCache = new Map<string, BskyClient>();

export type BskyLoginParams = {
  identifier: string;
  password: string;
  authFactorToken?: string;
};

export class BskyClient {
  private service = `https://${BSKY_DOMAIN}`;
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
    let client = clientCache.get(session.did);

    if (!client) {
      client = new BskyClient();
      await client.agent.resumeSession(destr(session));
      clientCache.set(session.did, client);
    }
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
