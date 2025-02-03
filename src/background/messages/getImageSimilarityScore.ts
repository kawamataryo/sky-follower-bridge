import type { PlasmoMessaging } from "@plasmohq/messaging";
import { getImageSimilarityScore } from "~lib/getImageSimilarityScore";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { url1, url2 } = req.body;
  try {
    const result = await getImageSimilarityScore(url1, url2);
    res.send({
      result,
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
