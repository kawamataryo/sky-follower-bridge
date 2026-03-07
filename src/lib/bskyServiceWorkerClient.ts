import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { sendToBackground } from "@plasmohq/messaging";

export class BskyServiceWorkerClient {
  private session: unknown;

  constructor(session?: unknown) {
    this.session = session;
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

  public getProfile = async (actor: string) => {
    const { result, error } = await sendToBackground({
      name: "getProfile",
      body: {
        session: this.session,
        actor,
      },
    });
    if (error) throw new Error(error.message);

    return result as ProfileView;
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
