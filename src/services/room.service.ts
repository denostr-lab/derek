
import { roomModel, subscriptionModel } from "@/models/room.model"
import { CreateSubscription, ModifierRoom, ModifierSubscription, Pagination, Room } from "@/types"

export const createRoom = async (room: Room) => {
  console.info('createRoom room: ', room)
  await roomModel.create(room);
}

export const findDirectRoomByRid = async (directRidList: string[], t: string) => {
  return roomModel.findOne({ rid: { "$in": directRidList }, t });
}

export const findRoomByRid = async (rid: string) => {
  return roomModel.findOne({ rid });
}

export const findRoomByRidList = async (ridList: string[]) => {
  return roomModel.find({ rid: { "$in": ridList } });
}

export const replaceRoomByRid = async (rid: string, modifier: Room) => {
  return roomModel.updateOne({ rid }, { $set: modifier });
}

export const updateRoomByRid = async (rid: string, modifier: ModifierRoom) => {
  console.info(`updateRoomByRid rid: ${rid}, modifier`, modifier);
  return roomModel.updateOne({ rid }, { $set: modifier });
}

export const createSubscriptions = async (subscriptions: CreateSubscription[]) => {
 return Promise.all(subscriptions.map((item) => subscriptionModel.create({
  ...item,
  archived: false,
  ts: new Date(),
})));
}

// 这里有可能出现sub还没有创建出来的情况
export const addSubscriptionsUnread = async (uids: string[], rid: string) => {
  console.info(`addSubscriptionsUnread rid: ${rid}, uids: `, uids)
  await subscriptionModel.updateMany(
    { u: { $in: uids }, rid },
    { 
      $inc: { unread: 1 },
      $set: {
        ts: new Date(),
      },
    },
    { upsert: true }
  )
  return findSubscriptionsByRidAndU(uids, rid)
}

export const findSubscriptionsByRidAndU = async (uids: string[], rid: string) => {
  return subscriptionModel.find({ u: { $in: uids }, rid });
}

export const updateSubscription = async (u: string, rid: string, modifier: ModifierSubscription) => {
  return subscriptionModel.findOneAndUpdate({
    u,
    rid
  }, { $set: modifier }, {
    returnDocument: "after"
  })
}

export const findSubscriptions = async (u: string, pagination: Pagination) => {
  const skip = pagination.pageSize * pagination.page;
  let sort = {}
  if (pagination.sortBy) {
    sort = { sort: { [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 } }
  }
  return subscriptionModel.find({ u }, {}, { limit: pagination.pageSize, skip, ...sort });
}

export const findSubscriptionAggregate = async (u: string, pagination: Pagination) => {
  const skip = pagination.pageSize * pagination.page;
  const limit = pagination.pageSize;
  return subscriptionModel.aggregate([
    {
      $match: {
        u
      }
    },
    {
      $lookup: {
        from: "rooms",
        localField: "rid",
        foreignField: "rid",
        as: "roomData"
      }
    },
    {
      $unwind: "$roomData"
    },
    {
      $sort: {
        "roomData.lastMessageTs": -1
      }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ]);
}