import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from 'config';


export const CREATE_SUB_QUEUE_NAME = "createSubscriptions";
export const UPDATE_SUB_QUEUE_NAME = "updateSubscriptions";

const REDIS_PORT = config.get("redisPort") as number;
const REDIS_HOST = config.get("redisHost") as string;
const BULLMQ_REDIS_DB = config.get("bullMQRedisDB") as number;

export const redisConnection = new IORedis({
  port: REDIS_PORT, // Redis port
  host: REDIS_HOST, // Redis host
  maxRetriesPerRequest: null,
  db: BULLMQ_REDIS_DB,
});

redisConnection.on('ready', () => {
  console.log('bullMQ Redis连接成功');
});

redisConnection.on('error', (error) => {
  console.error('bullMQ Redis连接错误:', error);
});

export const createSubQueue = new Queue(CREATE_SUB_QUEUE_NAME, { connection: redisConnection });
export const updateSubQueue = new Queue(UPDATE_SUB_QUEUE_NAME, { connection: redisConnection });