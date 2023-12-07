import { NextFunction, Request, Response } from "express";
import { readRoomMessageInput } from "@/schema/room.schema";
import { findSubscriptionAggregate, updateSubscription } from "@/services/room.service";
import { roomListConverter } from "@/converter/roomConverter";

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
    let { page = 0, pageSize = 10, since } = req.query;
    page = parseInt(page, 10) || 0;
    pageSize = parseInt(pageSize, 10) || 10;
    since = since > 0 ? parseInt(since, 10) : 0;
    let list = await findSubscriptionAggregate(pubkey, since, {
      page,
      pageSize,
    });

    list = roomListConverter(list);

    res.status(200).json({
      status: "success",
      data: {
        list,
        page
      },
    });
  } catch (err: any) {
    next(err);
  }
}
