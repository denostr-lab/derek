import { NextFunction, Request, Response } from "express";
import { readRoomMessageInput } from "@/schema/room.schema";
import { findRoomByRidList, findSubscriptionAggregate, findSubscriptions, updateSubscription } from "@/services/room.service";
import { Subscription, SubscriptionObj } from "@/types";
import { roomConverter } from "@/converter/roomConverter";

export const readRoomMessageHandler = async (
  req: Request<{}, {}, readRoomMessageInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pubkey, rid, unread } = req.body;
    // const events = await findBySubscriptionFilter(filters);
    console.info(`readRoomMessageHandler pubkey: ${pubkey}, rid: ${rid}, unread: ${unread}`)
    const subscription = await updateSubscription(pubkey, rid, {
      unread,
      ts: new Date()
    });
    console.info("updateSubscription result: ", subscription);
    res.status(200).json({
      status: "success",
      data: {
        subscription
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const roomsHandler = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pubkey } = req.params;
    let { pageNo = 0, pageSize = 10 } = req.query;
    pageNo = parseInt(req.query.pageNo, 10) || 0;
    pageSize = parseInt(req.query.pageSize, 10) || 10;
    const list = await findSubscriptionAggregate(pubkey, {
      pageNo,
      pageSize,
    });

    res.status(200).json({
      status: "success",
      data: {
        list,
        pageNo
      },
    });
  } catch (err: any) {
    next(err);
  }
}
