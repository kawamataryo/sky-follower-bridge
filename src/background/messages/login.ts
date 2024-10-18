import { ComAtprotoServerCreateSession } from "@atproto/api";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE } from "~lib/constants";
import { BskyClient } from "../../lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { identifier, password, authFactorToken } = req.body;

  try {
    const agent = await BskyClient.createAgent({
      identifier,
      password,
      ...(authFactorToken && { authFactorToken: authFactorToken }),
    });

    res.send({
      session: agent.session,
    });
  } catch (e) {
    if (
      e instanceof ComAtprotoServerCreateSession.AuthFactorTokenRequiredError
    ) {
      res.send({
        error: {
          message: AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE,
        },
      });
    } else {
      res.send({
        error: {
          message: e.message,
        },
      });
    }
  }
};

export default handler;
