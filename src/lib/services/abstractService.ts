import { MESSAGE_NAME_TO_QUERY_PARAM_MAP } from "~lib/constants";
import type { BskyUser, CrawledUserInfo, MessageName } from "~types";

export abstract class AbstractService {
  messageName: MessageName;
  crawledUsers: Set<string>;

  constructor(messageName: string) {
    this.messageName = messageName as MessageName;
    this.crawledUsers = new Set();
  }

  abstract isTargetPage(): [boolean, string];

  abstract processExtractedData(
    user: CrawledUserInfo,
  ): Promise<CrawledUserInfo>;

  abstract extractUserData(userCell: Element): CrawledUserInfo;

  getCrawledUsers(): CrawledUserInfo[] {
    const userCells = Array.from(
      document.querySelectorAll(
        MESSAGE_NAME_TO_QUERY_PARAM_MAP[this.messageName],
      ),
    );

    const users = Array.from(userCells).map((userCell) =>
      this.extractUserData(userCell),
    );
    const filteredUsers = users.filter((user) => {
      const isNewUser = !this.crawledUsers.has(user.accountName);
      if (isNewUser) {
        this.crawledUsers.add(user.accountName);
      }
      return isNewUser;
    });

    return filteredUsers;
  }

  abstract getScrollTarget(): HTMLElement | null;

  abstract scrollToBottom(): void;

  abstract checkEnd(): boolean;
}
