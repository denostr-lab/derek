import { UPDATE_SUB_QUEUE_NAME, createSubQueue, updateSubQueue } from '../bullMQ/createQueue';
import { NextFunction, Request, Response } from "express";
import {
  eventInput,
  eventFiltersInput,
  deleteEventInput,
} from "@/schema/event.schema";
import {
  insertEvent,
  replaceEvent,
  findBySubscriptionFilter,
  deleteEventsByIdAnyPubKey,
} from "@/services/event.service";
import { createRoom, findDirectRoomByRid, findRoomByRid, replaceRoomByRid } from "@/services/room.service";
import { CREATE_SUB_QUEUE_NAME } from "@/bullMQ/createQueue";
import { addJob } from '@/bullMQ/addJob';
import { Room } from '@/types';
import { normalizeDirectRoomAndSubData, normalizeGroupRoomAndSubData } from '@/utils/normalizeData';

export const findEventsHandler = async (
  req: Request<{}, {}, eventFiltersInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { filters } = req.body;
    const events = await findBySubscriptionFilter(filters);
    res.status(200).json({
      status: "success",
      data: {
        events,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

async function handleKind4Room(body: eventInput) {
  const input = body.event;
  const tags = input?.tags || [[]];
  const tagItem = (tags || []).find(item => item[0] === "p")
  if (!tagItem?.[1]) {
    throw new Error(`handleKind4Room recipient pubkey is empty, tagItem: ${tagItem}`)
  }
  console.info(`handleKind4Room kind: ${input.kind}, tagItem:`, tagItem, "tags: ", tags);
  const inputPubkey = input.pubkey;
  const recipientPubkey = tagItem[1] as string;
  const rid = `${inputPubkey}${recipientPubkey}`;
  const existRoom = await findDirectRoomByRid([`${inputPubkey}${recipientPubkey}`, `${recipientPubkey}${inputPubkey}`], "d");
  console.info(`findDirectRoomByRid rid: ${inputPubkey}${recipientPubkey} or ${recipientPubkey}${inputPubkey} existRoom: `, existRoom);
  const { room, subscriptions } = normalizeDirectRoomAndSubData(body, rid);
  if (!existRoom) {
    await createRoom(room);
    addJob(createSubQueue, CREATE_SUB_QUEUE_NAME, { subscriptions });
    return
  }
  const recipientPubkeys = existRoom.uids.filter(item => item !== inputPubkey)
  addJob(updateSubQueue, UPDATE_SUB_QUEUE_NAME, { uids: recipientPubkeys, rid: existRoom.rid, lastMessage: input });
}

async function handleCreateRoom(body: eventInput) {
  const input = body.event;
  let rid =  input.id;
  const { room, subscriptions, t } = normalizeGroupRoomAndSubData(body, rid);
  // own 的 subscription
  subscriptions.unshift({
    t,
    u: input.pubkey,
    rid: input.id,
    unread: 0,
    isOwner: true
  })
  await createRoom(room);

  addJob(createSubQueue, CREATE_SUB_QUEUE_NAME, { subscriptions });
}

function getInputRid(body: eventInput) {
  const input = body.event;
  let rid =  input.id;
  const tags = input?.tags || [[]];
  const tagItem = (tags || []).find(item => item[0] === "e")
  console.info(`kind: ${input.kind}, tagItem:`, tagItem, "tags: ", tags);
  if (tagItem?.[1]) {
    rid = tagItem[1];
  }
  return rid;
}

async function handleUpdateRoom(body: eventInput) {
  const input = body.event;
  const rid =  getInputRid(body);
  const dataRoom = await findRoomByRid(rid);
  if (!dataRoom) {
    throw new Error(`handleUpdateRoom findRoomByRid is empty, rid: ${rid}`)
  }
  if (dataRoom.u !== input.pubkey) {
    throw new Error(`handleUpdateRoom Not the owner of the room, key: ${input.pubkey}, room key: ${dataRoom.u}`)
  }
  const { room, subscriptions } = normalizeGroupRoomAndSubData(body, rid);
  await replaceRoomByRid(rid, room);

  const dataRoomUids = dataRoom.uids;
  const newSubscriptions = subscriptions.filter(item => !dataRoomUids.includes(item.u))

  addJob(createSubQueue, CREATE_SUB_QUEUE_NAME, { subscriptions: newSubscriptions });
}

async function handleGroupMessage(body: eventInput) {
  const input = body.event;
  const rid =  getInputRid(body);
  const dataRoom = await findRoomByRid(rid);
  if (!dataRoom) {
    throw new Error(`handleUpdateRoom findRoomByRid is empty, rid: ${rid}`)
  }
  if (!dataRoom.uids.includes(input.pubkey)) {
    throw new Error(`handleUpdateRoom Not a group member, key: ${input.pubkey}, room key: ${dataRoom.uids}`)
  }

  const uids = dataRoom.uids.filter(item => item !== input.pubkey);
  addJob(updateSubQueue, UPDATE_SUB_QUEUE_NAME, { uids, rid, lastMessage: input });
}

const handlers: Record<number, (args: eventInput) => void> =  {
  4: (args: eventInput) => handleKind4Room(args),
  40: (args: eventInput) => handleCreateRoom(args),
  41: (args: eventInput) => handleUpdateRoom(args),
  42: (args: eventInput) => handleGroupMessage(args)
}

export const saveEventHandler = async (
  req: Request<{}, {}, eventInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const ReplaceAbleEventKinds = [0, 3, 41];
    const kind = req.body.event.kind;
    let handleRes = null;
    if (
      ReplaceAbleEventKinds.includes(kind) ||
      (kind >= 10000 && kind < 20000) ||
      (kind >= 30000 && kind <= 40000)
    ) {
      
      if (handlers.hasOwnProperty(kind)) {
        const eventHandler = handlers[kind];
        await eventHandler(req.body);
      }

      handleRes = await replaceEvent(req.body.event);
    } else {

      if (handlers.hasOwnProperty(kind)) {
        const eventHandler = handlers[kind];
        await eventHandler(req.body);
      }

      handleRes = await insertEvent(req.body.event);
    }
    res.status(200).json({
      status: "success",
      data: {
        ...handleRes,
      },
    });
  } catch (err: any) {
    console.info(err, 'save 错误')
    next(err);
  }
};

export const deleteEventHandler = async (
  req: Request<{}, {}, deleteEventInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pubkey, eventIdsToDelete } = req.body;
    console.info(pubkey, eventIdsToDelete, '删除掉')
    const deleteRes = await deleteEventsByIdAnyPubKey(pubkey, eventIdsToDelete);
    res.status(200).json({
      status: "success",
      data: {
        ...deleteRes,
      },
    });
  } catch (err: any) {
    next(err);
  }
};
