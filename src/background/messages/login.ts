import { ComAtprotoServerCreateSession } from "@atproto/api";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { AUTH_FACTOR_TOKEN_REQUIRED_ERROR_MESSAGE } from "~lib/constants";
import { BskyClient } from "../../lib/bskyClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { domain, identifier, password, authFactorToken } = req.body;
  console.log("[handler] Received domain:", domain); // DEBUG domain received

  try {
    // Prepare params, only include domain if truthy
    const params: {
      identifier: string;
      password: string;
      domain?: string;
      authFactorToken?: string;
    } = {
      identifier,
      password,
    };

    if (domain) params.domain = domain;
    if (authFactorToken) params.authFactorToken = authFactorToken;

    console.log("[Caller] Using domain:", params.domain);

    // Pass the prepared params object here instead of hardcoded values
    const agent = await BskyClient.createAgent(params);

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
