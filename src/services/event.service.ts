import { SubscriptionFilter } from "@/@types/subscription";
import { Sort } from "@/constants/base";
import eventModel, { Event } from "@/models/event.model";
import { InputEvent } from "@/@types/event";
import { normalizeEvent, toNostrEvent, buildMongoFilter } from "@/utils/event";

export const replaceEvent = async (event: InputEvent) => {
  const row = normalizeEvent(event);
  if (event.kind === 0){
    console.info(event, '最后一个')

  }
  const deleteEvent =  await eventModel.findOne({
    kind: 5,
    id: event.id
  })
  console.info(deleteEvent, 'deleteEventdeleteEventdeleteEvent')
  if (deleteEvent) {
    return { count: 0 }
  }
  const res = await eventModel.updateOne(
    { kind: event.kind , pubkey: event.pubkey },
    {
      $set: row,
    },
    { upsert: true }
  );
  if (event.kind === 0){
    console.info(res, 'rerererer')

  }
  return {
    ...res,
    count: res.modifiedCount || res.upsertedCount,
  };
};

export const insertEvent = async (event: InputEvent) => {
  const row = normalizeEvent(event);
  if (event?.content === "Nostr FTW!") {
    console.info("RestEventRepository insert:", event, row);
  }
  await eventModel.create(row);
  return {
    event,
    count: 1,
  };
};

export const deleteEventsByIdAnyPubKey = async (
  pubkey: string,
  ids: string[]
) => {
  const a = await eventModel.find({ id: { $in: ids } });
  const res = await eventModel.deleteMany({ pubkey, id: { $in: ids } });
  console.info(res, "有存在吗", a, "删除的结果", pubkey, typeof pubkey, ids);
  return {
    ...res,
    count: res.deletedCount,
  };
};

export const findBySubscriptionFilter = async (
  filters: SubscriptionFilter[],
  maxLimit: number = 500
) => {
  const query = buildMongoFilter(filters);
  const defaultLimit = 500;
  let sort = Sort.ASC;
  let limit = Math.max(
    ...filters.map((filter) => {
      if (typeof filter.limit !== "undefined") {
        sort = Sort.DESC;
      }
      return filter.limit ?? defaultLimit;
    })
  );
  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const events = (
    await eventModel.find(query).limit(limit).sort({ created_at: sort })
  ).map(toNostrEvent);
  return events;
};
