import { Agent } from "@atproto/api";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { BskyClient } from "~lib/bskyClient";
import { loginWithOAuth } from "~lib/bskyOAuthClient";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { identifier, password, authFactorToken, service, authMethod } =
    req.body;

  try {
    if (authMethod === "app-password") {
      const { client, sessionData } = await BskyClient.createAgent({
        identifier,
        password,
        authFactorToken,
        service,
      });
      const profile = await client.getMyProfile();

      res.send({
        session: {
          authMethod: "app-password",
          service,
          session: JSON.stringify(sessionData),
        },
        profile: {
          displayName: profile.displayName,
          avatar: profile.avatar,
        },
      });
    } else {
      const session = await loginWithOAuth(identifier);
      const agent = new Agent(
        session as ConstructorParameters<typeof Agent>[0],
      );
      const profile = await agent.getProfile({
        actor: session.sub,
      });

      res.send({
        session: {
          authMethod: "oauth",
          sub: session.sub,
        },
        profile: {
          displayName: profile.data.displayName,
          avatar: profile.data.avatar,
        },
      });
    }
  } catch (e) {
    res.send({
      error: {
        message: e instanceof Error ? e.message : String(e),
      },
    });
  }
};

export default handler;
