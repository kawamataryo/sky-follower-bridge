import consola from "consola";

const proxyUrl = "https://server.sky-follower-bridge.dev/proxy?url=";
const SIMILARITY_THRESHOLD = 0.65;

async function fetchImage(url: string): Promise<Blob> {
  consola.warn("fetching image from", url);

  if (url.startsWith("data:")) {
    const mimeType = url.substring(5, url.indexOf(";"));
    const base64Data = url.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  const response = await fetch(proxyUrl + encodeURIComponent(url));
  consola.warn("response", response);
  return await response.blob();
}

export async function checkImageSimilarity(
  url1: string,
  url2: string,
): Promise<boolean> {
  const blob1 = await fetchImage(url1);
  const blob2 = await fetchImage(url2);

  const imageBitmap1 = await createImageBitmap(blob1);
  const imageBitmap2 = await createImageBitmap(blob2);

  const width = 50;
  const height = 50;

  const offscreenCanvas1 = new OffscreenCanvas(width, height);
  const offscreenCanvas2 = new OffscreenCanvas(width, height);
  const context1 = offscreenCanvas1.getContext("2d");
  const context2 = offscreenCanvas2.getContext("2d");

  if (!context1 || !context2) {
    throw new Error("Canvas context not available");
  }

  context1.drawImage(imageBitmap1, 0, 0, width, height);
  context2.drawImage(imageBitmap2, 0, 0, width, height);

  const data1 = context1.getImageData(0, 0, width, height).data;
  const data2 = context2.getImageData(0, 0, width, height).data;

  const similarity = calculateSimilaritySimple(data1, data2);

  return similarity > SIMILARITY_THRESHOLD;
}

function calculateSimilaritySimple(
  data1: Uint8ClampedArray,
  data2: Uint8ClampedArray,
): number {
  if (data1.length !== data2.length) return 0;

  let similarPixels = 0;
  for (let i = 0; i < data1.length; i += 4) {
    const rDiff = Math.abs(data1[i] - data2[i]);
    const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
    const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);

    if (rDiff < 50 && gDiff < 50 && bDiff < 50) {
      similarPixels++;
    }
  }

  return similarPixels / (data1.length / 4);
}
