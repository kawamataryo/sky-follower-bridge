import type { PlasmoMessaging } from "@plasmohq/messaging";

const API_URL = "https://sfb-server.ba068082.workers.dev/followings";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { handle, followings } = req.body;
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        handle,
        followings,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to save followings: ${response.statusText}`);
    }
    res.send({
      result: "ok",
    });
  } catch (e) {
    res.send({
      error: {
        message: e.message,
      },
    });
  }
};

export default handler;
