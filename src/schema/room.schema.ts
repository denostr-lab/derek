import { object, string, TypeOf, number } from 'zod';

const params = {
  params: object({
    pubkey: string({ required_error: 'pubkey is required' }),
  }),
};

export const readRoomMessageSchema = object({
  body: object({
    rid: string({ required_error: 'rid is required' }),
    pubkey: string({ required_error: 'pubkey is required' }),
    unread: number({ required_error: 'unread is required' }),
  }),
})

export const roomListSchema = object({
  ...params,
  query: object({
    pageNo: number().optional(),
    pageSize: number().optional(),
  }),
})

export type readRoomMessageInput = TypeOf<typeof readRoomMessageSchema>['body'];