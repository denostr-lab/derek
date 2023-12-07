import { CreateRoomContent } from '@/types';
import { Room } from '@/types';
import { eventInput } from './../schema/event.schema';


/**
 * @summary 根据事件类型返回指定的房间类型
 * @param {number} kind - 接收到的事件类型
 * @returns
 */
function getRoomType(kind: number) {
  if ([40, 41].includes(kind)) {
    return 'c'
  }
  if ([4].includes(kind)) {
    return 'd'
  }
}

/**
 * @summary 构造私聊的room & subscriptions 的数据结构并返回
 * @param {Object} body - request body
 * @param {string} rid - room id
 * @returns 
 */
export const normalizeDirectRoomAndSubData = (body: eventInput, rid: string) => {
  const input = body.event;
  const tags = input?.tags || [[]];
  const eventPubkeys: string[] = [];
  (tags || []).forEach(item => {
    if (item[0] === "p") {
      eventPubkeys.push(
        item[1],
      )
    }
  })
  eventPubkeys.push(input.pubkey);
  const roomType = getRoomType(input.kind);
  if(!roomType) {
    throw new Error(`getRoomType room type empty, kind: ${input.kind}`)
  }

  // 数据整理
  const room: Room = {
    rid,
    t: roomType,
    u: input.pubkey,
    uids: eventPubkeys,
    lastMessageId: input.id,
    lastMessage: input,
    lastMessageTs: input.created_at,
    ts: new Date()
  }
  const subscriptions = eventPubkeys.map(item => ({
    t: roomType,
    u: item,
    rid: rid,
    unread: input.pubkey === item ? 0 : 1,
    isOwner: input.pubkey === item
  }))

  return { room, subscriptions };
}

/**
 * @summary 构造群聊的room & subscriptions 的数据结构并返回
 * @param {Object} body - request body
 * @param {string} rid - room id
 * @returns 
 */
export const normalizeGroupRoomAndSubData = (body: eventInput, rid: string) => {
  const input = body.event;
  // const eventContent = { name: "2342", about: "about", picture: "picture" }
  const eventContent = JSON.parse(input.content) as CreateRoomContent;
  const tags = input?.tags || [[]];
  const eventPubkeys: string[] = [];
  (tags || []).forEach(item => {
    if (item[0] === "p") {
      eventPubkeys.push(
        item[1],
      )
    }
  })
  const roomType = getRoomType(input.kind);
  if(!roomType) {
    throw new Error(`getRoomType room type empty, kind: ${input.kind}`)
  }

  // 数据整理
  const room: Room = {
    rid,
    t: roomType,
    name: eventContent?.name,
    fname: eventContent?.name,
    picture: eventContent?.picture,
    about: eventContent?.about,
    u: input.pubkey,
    uids: eventPubkeys,
    lastMessageTs: input.created_at,
    ts: new Date()
  }
  if (input.kind !== 40) {
    room.lastMessageId = input.id;
  }
  const subscriptions = eventPubkeys.map(item => ({
    t: roomType,
    u: item,
    rid,
    unread: 0,
    isOwner: false
  }))

  return { room, subscriptions, t: roomType, };
}