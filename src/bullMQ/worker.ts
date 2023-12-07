import { CreateSubscription, Subscription, StreamSubscription } from '@/types';
import { CREATE_SUB_QUEUE_NAME, UPDATE_SUB_QUEUE_NAME, redisConnection } from '@/bullMQ/createQueue';
import { createSubscriptions, updateRoomByRid, addSubscriptionsUnread } from '@/services/room.service';
import { publishDataToStream } from '@/utils/connectRedis';
import { Worker, Job } from 'bullmq';
import config from 'config';

const BULLMQ_REDIS_REMOVE_COMPLETE_COUNT = parseInt(config.get("bullMQRedisRemoveCompleteCount"), 10) as number || 5000;
const BULLMQ_REDIS_REMOVE_FAIL_COUNT = parseInt(config.get("bullMQRedisRemoveFailCount"), 10) as number|| 5000;

/**
 * @summary 处理创建房间是和修改房间相关行为的worker
 */
export const bullWorker = new Worker(CREATE_SUB_QUEUE_NAME, async (job: any)=> {
  const { data, id } = job;
  // 逻辑处理
  try {
    console.info(`bullWorker ${CREATE_SUB_QUEUE_NAME} start jobId: ${id}, data: `, data);
    if (!data.subscriptions || (Array.isArray(data.subscriptions) && data.subscriptions.length < 1)) {
      console.info(`${CREATE_SUB_QUEUE_NAME} worker jobid: ${id}, data: `, data);
      return;
    }
    await createSubscriptions(data.subscriptions);
    const items: string[] = [];
    (data.subscriptions || []).forEach((item: CreateSubscription) => {
      if (!item.isOwner) {
        items.push(item.rid)
      }
    })
    publishDataToStream("roomNotice", items)
  } catch (error: any) {
    console.info("mq worker createSubscriptions error", error, "id:", id);
    throw new Error(error?.message)
  }

  return { id };
}, { 
  autorun: false,
  connection: redisConnection,
  removeOnComplete: { count: BULLMQ_REDIS_REMOVE_COMPLETE_COUNT },
  removeOnFail: { count: BULLMQ_REDIS_REMOVE_FAIL_COUNT },
});


bullWorker.on('completed', (job: Job, returnvalue: any) => {
  const { name } = job;
  // Do something with the return value.
  console.log(`bullWorker ${name} completed, returnvalue`, returnvalue);
});

bullWorker.on('failed', (job, err) => {
  console.log(`bullWorker ${job?.name} has failed with ${err.message}`, "jobID:", job?.id);
});

/**
 * @summary 处理修改 subscription 未读数的worker
 */
export const updateSubWorker = new Worker(UPDATE_SUB_QUEUE_NAME, async (job: any)=> {
  const { data, id } = job;
  // 逻辑处理
  try {
    console.info(`updateSubWorker ${UPDATE_SUB_QUEUE_NAME} start jobId: ${id}, data: `, data);
    if (!data || !data?.rid) {
      console.info(`${UPDATE_SUB_QUEUE_NAME} worker jobid: ${id}, data: ---> `, data);
      return;
    }
    await updateRoomByRid(data.rid, {
      lastMessage: data.lastMessage,
      lastMessageTs: data.lastMessage.created_at,
      ts: new Date()
    })
    console.info(`updateSubWorker data?.uids.lenth: ${data?.uids.length}`, 'rid: ', data?.rid);
    if (data?.uids.length > 0) {
      const newSubscriptionList = await addSubscriptionsUnread(data?.uids, data?.rid);
      const items = newSubscriptionList.map((item: Subscription) => item.rid);
      publishDataToStream("roomNotice", items)
    }
  } catch (error) {
    console.info("mq updateSubWorker error", error, "id:", id);
  }

  return { id };
}, { 
  autorun: false,
  connection: redisConnection,
  removeOnComplete: { count: BULLMQ_REDIS_REMOVE_COMPLETE_COUNT },
  removeOnFail: { count: BULLMQ_REDIS_REMOVE_FAIL_COUNT },
});


updateSubWorker.on('completed', (job: Job, returnvalue: any) => {
  const { name } = job;
  // Do something with the return value.
  console.log(`updateSubWorker ${name} completed, returnvalue`, returnvalue);
});

updateSubWorker.on('failed', (job, err) => {
  console.log(`updateSubWorker ${job?.name} has failed with ${err.message}`, "jobID:", job?.id);
});