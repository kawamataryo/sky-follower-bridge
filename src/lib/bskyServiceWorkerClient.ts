import type { AtpSessionData } from "@atproto/api";
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { sendToBackground } from "@plasmohq/messaging";
import { setToChromeStorage } from "~lib/chromeHelper";
import { STORAGE_KEYS } from "./constants";

export type BskyLoginParams = {
  identifier: string;
  password: string;
  authFactorToken?: string;
};

export class BskyServiceWorkerClient {
  private session = {} as AtpSessionData;

  constructor(session: AtpSessionData) {
    this.session = session;
  }

  public static async createAgentFromLoginParams({
    identifier,
    password,
    authFactorToken,
  }: BskyLoginParams): Promise<BskyServiceWorkerClient> {
    const { session, error } = await sendToBackground({
      name: "login",
      body: {
        identifier,
        password,
        ...(authFactorToken && { authFactorToken: authFactorToken }),
      },
    });
    if (error) throw new Error(error.message);

    await setToChromeStorage(STORAGE_KEYS.BSKY_CLIENT_SESSION, session);

    return new BskyServiceWorkerClient(session);
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

  public createList = async ({
    name,
    description,
  }: {
    name: string;
    description: string;
  }) => {
    const { uri, error } = await sendToBackground({
      name: "createList",
      body: {
        session: this.session,
        name,
        description,
      },
    });
    if (error) throw new Error(error.message);

    return uri;
  };

  public addUserToList = async ({
    userDid,
    listUri,
  }: {
    userDid: string;
    listUri: string;
  }) => {
    const { result, error } = await sendToBackground({
      name: "addUserToList",
      body: {
        session: this.session,
        userDid,
        listUri,
      },
    });
    if (error) throw new Error(error.message);

    return result;
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
    const listId = listUri.split("/").pop();
    return listId;
  };

  public getMyProfile = async () => {
    const { result, error } = await sendToBackground({
      name: "getMyProfile",
      body: {
        session: this.session,
      },
    });
    if (error) throw new Error(error.message);

    return result;
  };
}
