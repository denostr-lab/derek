// import { createClient } from 'redis';
import Redis from 'ioredis';
import config from 'config';

const REDIS_PORT = config.get("redisPort") as number;
const REDIS_HOST = config.get("redisHost") as string;
const REDIS_DB = config.get("redisDB") as number;
const REDIS_MAX_STREAM_LENGTH = config.get("redisMaxStreamLength") as number;


const redisClient = new Redis({
  port: REDIS_PORT, // Redis port
  host: REDIS_HOST, // Redis host
  maxRetriesPerRequest: null,
  db: REDIS_DB,
  lazyConnect: true, // 禁用自动连接
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected success...');
  } catch (err: any) {
    console.log(`Connect redis error: `, err);
    setTimeout(connectRedis, 5000);
  }
};

redisClient.on('connect', () => {
  console.log('Connected to Redis server');
});

redisClient.on('error', (err) => console.log(err));

export async function addDataToStream(key: string, data: string) {
  const keyValuePairs = ['data', data];
  console.info(`addDataToStream data: ${data}`)
  await redisClient.xadd(key, "*", ...keyValuePairs);

  const streamLength = await redisClient.xlen(key);
  if (streamLength > REDIS_MAX_STREAM_LENGTH) {
    const trimLength = streamLength - REDIS_MAX_STREAM_LENGTH;
    await redisClient.xtrim(key, "MAXLEN", "~", trimLength);
  }
}

export default redisClient;
