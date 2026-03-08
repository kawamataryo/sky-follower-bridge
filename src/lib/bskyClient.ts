import {
  Agent,
  AtpAgent,
  type AtpSessionData,
  AtUri,
  type ProfileView,
} from "@atproto/api";
import destr from "destr";
import type { OAuthSessionData } from "~types";
import { restoreOAuthSession } from "./bskyOAuthClient";
import { BSKY_DOMAIN } from "./constants";

// try and cut down the amount of session resumes by caching the clients
const clientCache = new Map<string, BskyClient>();
const clientLoadPromiseCache = new Map<string, Promise<BskyClient>>();

export const clearBskyClientCache = (id?: string) => {
  if (id) {
    clientCache.delete(id);
    clientLoadPromiseCache.delete(id);
    return;
  }

  clientCache.clear();
  clientLoadPromiseCache.clear();
};

export class BskyClient {
  private service = `https://${BSKY_DOMAIN}`;
  me: {
    did: string;
    handle: string;
    email: string;
  };
  agent: AtpAgent | Agent;
  session = {};

  private constructor() {
    this.agent = new AtpAgent({
      service: this.service,
      persistSession: (_evt, session) => {
        this.session = session;
      },
    });
  }

  public static async createAgentFromSession(
    session?: AtpSessionData | OAuthSessionData | string,
  ): Promise<BskyClient> {
    const parsedSession =
      typeof session === "string"
        ? destr<AtpSessionData | OAuthSessionData>(session)
        : session;

    if (parsedSession?.did) {
      let client = clientCache.get(parsedSession.did);

      if (!client) {
        client = new BskyClient();
        await (client.agent as AtpAgent).resumeSession(destr(parsedSession));
        clientCache.set(parsedSession.did, client);
      }
      client.me = {
        did: parsedSession.did,
        handle: parsedSession.handle,
        email: parsedSession.email,
      };
      return client;
    }

    const sub = parsedSession?.sub;
    if (!sub) {
      throw new Error("No active OAuth session found.");
    }

    const cachedClient = clientCache.get(sub);
    if (cachedClient) {
      return cachedClient;
    }

    let clientPromise = clientLoadPromiseCache.get(sub);
    if (!clientPromise) {
      clientPromise = (async () => {
        const oauthSession = await restoreOAuthSession();
        if (!oauthSession) {
          throw new Error("No active OAuth session found.");
        }

        let client = clientCache.get(sub);
        if (!client) {
          client = new BskyClient();
          client.agent = new Agent(
            oauthSession as ConstructorParameters<typeof Agent>[0],
          );
          const profile = await client.agent.getProfile({ actor: sub });
          client.me = {
            did: sub,
            handle: profile.data.handle,
            email: "",
          };
          clientCache.set(sub, client);
        }
        return client;
      })().finally(() => {
        clientLoadPromiseCache.delete(sub);
      });
      clientLoadPromiseCache.set(sub, clientPromise);
    }

    return await clientPromise;
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

  public getProfile = async (actor: string): Promise<ProfileView> => {
    const result = await this.agent.getProfile({ actor });
    return result.data as ProfileView;
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
    const actorDid = this.me?.did || this.agent.session?.did;
    const profile = await this.agent.getProfile({
      actor: actorDid,
    });
    return {
      pdsUrl: this.agent.pdsUrl,
      did: actorDid,
      handle: this.me?.handle || profile.data.handle,
      displayName: profile.data.displayName,
      avatar: profile.data.avatar,
    };
  };
}
