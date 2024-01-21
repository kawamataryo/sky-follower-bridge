import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { sendToBackground } from "@plasmohq/messaging";

export type BskyLoginParams = {
  identifier: string;
  password: string;
};

export class BskyServiceWorkerClient {
  private session = {};

  private constructor() {}

  public static async createAgent({
    identifier,
    password,
  }: BskyLoginParams): Promise<BskyServiceWorkerClient> {
    const client = new BskyServiceWorkerClient();
    const { session, error } = await sendToBackground({
      name: "login",
      body: {
        identifier,
        password,
      },
    });
    if (error) throw new Error(error.message);

    client.session = session;
    return client;
  }

  public searchUser = async ({
    term,
    limit,
  }: {
    term: string;
    limit: number;
  }) => {
    const { actors, error } = await sendToBackground({
      name: "searchUser",
      body: {
        session: this.session,
        term,
        limit,
      },
    });
    if (error) throw new Error(error.message);

    return actors as ProfileView[];
  };

  public follow = async (subjectDid: string) => {
    const { result, error } = await sendToBackground({
      name: "follow",
      body: {
        session: this.session,
        subjectDid,
      },
    });
    if (error) throw new Error(error.message);

    return result;
  };

  public unfollow = async (followUri: string) => {
    const { result, error } = await sendToBackground({
      name: "unfollow",
      body: {
        session: this.session,
        followUri,
      },
    });
    if (error) throw new Error(error.message);

    return result;
  };

  public block = async (subjectDid: string) => {
    const { result, error } = await sendToBackground({
      name: "block",
      body: {
        session: this.session,
        subjectDid,
      },
    });
    if (error) throw new Error(error.message);

    return result;
  };

  public unblock = async (blockUri: string) => {
    // TODO: unblock is not working. Need to fix it.
    const { result, error } = await sendToBackground({
      name: "unblock",
      body: {
        session: this.session,
        blockUri,
      },
    });
    if (error) throw new Error(error.message);

    return result;
  };
}
