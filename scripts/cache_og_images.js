const BASE_URL = "https://share.sky-follower-bridge.dev/og";
const START_NUM = 1;
const END_NUM = 3000;
const CONCURRENT_LIMIT = 10;
const DELAY_MS = 100;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
    }
    await sleep(1000); // リトライ前に1秒待機
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

async function processBatch(numbers) {
  const promises = numbers.map(async (num) => {
    const url = `${BASE_URL}?q=${num}`;
    try {
      await fetchWithRetry(url);
      console.log(`✅ Cached: ${url}`);
    } catch (error) {
      console.error(`❌ Failed: ${url}`);
    }
    await sleep(DELAY_MS);
  });

  await Promise.all(promises);
}

async function main() {
  const numbers = Array.from({ length: END_NUM - START_NUM + 1 }, (_, i) => START_NUM + i);
  const batches = [];

  for (let i = 0; i < numbers.length; i += CONCURRENT_LIMIT) {
    batches.push(numbers.slice(i, i + CONCURRENT_LIMIT));
  }

  console.log(`Starting cache creation for ${numbers.length} images...`);
  console.log(`Processing in batches of ${CONCURRENT_LIMIT}`);

  for (const [index, batch] of batches.entries()) {
    console.log(`Processing batch ${index + 1}/${batches.length}`);
    await processBatch(batch);
  }

  console.log("Cache creation completed!");
}

main().catch(console.error);
