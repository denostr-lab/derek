import { CreateSubscription, Subscription, StreamSubscription } from '@/types';
import { CREATE_SUB_QUEUE_NAME, UPDATE_SUB_QUEUE_NAME, redisConnection } from '@/bullMQ/createQueue';
import { createSubscriptions, updateRoomByRid, addSubscriptionsUnread } from '@/services/room.service';
import { addDataToStream } from '@/utils/connectRedis';
import { Worker, Job } from 'bullmq';

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
    const items: StreamSubscription[] = [];
    (data.subscriptions || []).forEach((item: CreateSubscription) => {
      if (!item.isOwner) {
        items.push({ p: item.u, rid: item.rid, unread: 0 })
      }
    })
    addDataToStream("subs-stream", JSON.stringify(items))
  } catch (error: any) {
    console.info("mq worker createSubscriptions error", error, "id:", id);
    throw new Error(error?.message)
  }

  return { id };
}, { 
  autorun: false,
  connection: redisConnection,
  removeOnComplete: { count: 1000 },
  // removeOnFail: { count: 1000 },
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
    console.info(`updateSubWorker data?.uids.lenth: ${data?.uids.length}`);
    if (data?.uids.length > 0) {
      const newSubscriptionList = await addSubscriptionsUnread(data?.uids, data?.rid);
      const items = newSubscriptionList.map((item: Subscription) => ({ p: item.u, rid: item.rid, unread: item.unread }));
      addDataToStream("subs-stream", JSON.stringify(items))
    }
  } catch (error) {
    console.info("mq updateSubWorker error", error, "id:", id);
  }

  return { id };
}, { 
  autorun: false,
  connection: redisConnection,
  removeOnComplete: { count: 1000 },
  // removeOnFail: { count: 1000 },
});


updateSubWorker.on('completed', (job: Job, returnvalue: any) => {
  const { name } = job;
  // Do something with the return value.
  console.log(`updateSubWorker ${name} completed, returnvalue`, returnvalue);
});

updateSubWorker.on('failed', (job, err) => {
  console.log(`updateSubWorker ${job?.name} has failed with ${err.message}`, "jobID:", job?.id);
});