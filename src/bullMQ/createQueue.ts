import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export const CREATE_SUB_QUEUE_NAME = "createSubscriptions";
export const UPDATE_SUB_QUEUE_NAME = "updateSubscriptions";

export const redisConnection = new IORedis({
  port: 6379, // Redis port
  host: "127.0.0.1", // Redis host
  maxRetriesPerRequest: null,
  db: 1,
});

export const createSubQueue = new Queue(CREATE_SUB_QUEUE_NAME, { connection: redisConnection });
export const updateSubQueue = new Queue(UPDATE_SUB_QUEUE_NAME, { connection: redisConnection });