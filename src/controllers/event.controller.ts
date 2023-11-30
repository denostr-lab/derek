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
      handleRes = await replaceEvent(req.body.event);
    } else {
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
