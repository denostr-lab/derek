// import { createClient } from 'redis';
import Redis from 'ioredis';
import config from 'config';

const MAX_STREAM_LENGTH = 1000;

// const redisUrl = config.get("redisUrl") as string;
const redisClient = new Redis({
  port: 6379, // Redis port
  host: "127.0.0.1", // Redis host
  maxRetriesPerRequest: null,
  db: 0,
  lazyConnect: true, // 禁用自动连接
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected...');
  } catch (err: any) {
    console.log(err, "============");
    setTimeout(connectRedis, 5000);
  }
};

redisClient.on('connect', () => {
  console.log('Connected to Redis server');
});

redisClient.on('error', (err) => console.log(err));

export async function addDataToStream(key: string, data: string) {
  const keyValuePairs = ['data', data];
  await redisClient.xadd(key, "*", ...keyValuePairs);

  const streamLength = await redisClient.xlen(key);
  if (streamLength > MAX_STREAM_LENGTH) {
    const trimLength = streamLength - MAX_STREAM_LENGTH;
    await redisClient.xtrim(key, "MAXLEN", "~", trimLength);
  }
}

export default redisClient;
