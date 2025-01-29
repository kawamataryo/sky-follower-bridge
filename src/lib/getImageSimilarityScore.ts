const proxyUrl = "https://server.sky-follower-bridge.dev/proxy?url=";

async function fetchImage(url: string): Promise<Blob> {
  if (url.startsWith("data:image")) {
    const response = await fetch(url);
    return await response.blob();
  }
  const response = await fetch(proxyUrl + encodeURIComponent(url));
  return await response.blob();
}

export async function getImageSimilarityScore(
  url1: string,
  url2: string,
): Promise<number> {
  if (!url1 || !url2) {
    return 0;
  }

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

  imageBitmap1.close();
  imageBitmap2.close();

  const data1 = context1.getImageData(0, 0, width, height).data;
  const data2 = context2.getImageData(0, 0, width, height).data;

  const similarity = calculateSimilaritySimple(data1, data2);

  return similarity;
}

function calculateSimilaritySimple(
  data1: Uint8ClampedArray,
  data2: Uint8ClampedArray,
): number {
  if (data1.length !== data2.length) return 0;

  let similarPixels = 0;
  for (let i = 0; i < data1.length; i += 8) {
    const gray1 = (data1[i] + data1[i + 1] + data1[i + 2]) / 3;
    const gray2 = (data2[i] + data2[i + 1] + data2[i + 2]) / 3;

    if (Math.abs(gray1 - gray2) < 50) {
      similarPixels++;
    }
  }

  return similarPixels / (data1.length / 8);
}
