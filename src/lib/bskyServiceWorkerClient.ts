import { sendToBackground } from "@plasmohq/messaging";

export type BskyLoginParams = {
  identifier: string;
  password: string;
}

export class BskyServiceWorkerClient {
  private session = {}

  private constructor() {
  }

  public static async createAgent({
    identifier,
    password,
  }: BskyLoginParams): Promise<BskyServiceWorkerClient> {
    const client = new BskyServiceWorkerClient();
    const { session } = await sendToBackground({
      name: "login",
      body: {
        identifier,
        password,
      }
    })
    client.session = session
    return client;
  }

  public searchUser = async ({
    term,
    limit,
  }: {
    term: string;
    limit: number;
  }) => {
    const { actors } = await sendToBackground({
      name: "searchUser",
      body: {
        session: this.session,
        term,
        limit,
      }
    })
    return actors;
  };

  public follow = async (subjectDid: string) => {
    const { result } = await sendToBackground({
      name: "follow",
      body: {
        session: this.session,
        subjectDid
      }
    })
    return result;
  }

  public unfollow = async (followUri: string) => {
    const { result } = await sendToBackground({
      name: "unfollow",
      body: {
        session: this.session,
        followUri
      }
    })
    return result;
  }

  public block = async (subjectDid: string) => {
    const { result } = await sendToBackground({
      name: "block",
      body: {
        session: this.session,
        subjectDid
      }
    })
    return result;
  }

  public unblock = async (blockUri: string) => {
    // TODO: unblock is not working. Need to fix it.
    const { result } = await sendToBackground({
      name: "unblock",
      body: {
        session: this.session,
        blockUri
      }
    })
    return result;
  }
}
