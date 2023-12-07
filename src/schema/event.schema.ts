import { object, string, TypeOf, number, array } from 'zod';


export const eventSchema = object({
  body: object({
    event: object({ 
      id: string({ required_error: 'id is required' }),
      pubkey: string({ required_error: 'pubkey is required' }),
      created_at: number({ required_error: 'created_at is required'}),
      kind: number({ required_error: 'kind is required' }),
      tags: array(array(string())),
      sig: string({ required_error: 'sig is required' }),
      content: string({ required_error: 'content is required' }),
      deleted_at: string().optional(),
      remote_address: object({
        address: string().optional(),
        port: number().optional(),
        family: string().optional(),
        flowlabel: number().optional(),
      }).optional()
    })
  }),
});
export const roomEventSchema = object({
  body: object({
    room_id: string({ required_error: 'room_id is required' }),
    limit: number().optional(),
    cursor: number().optional(),
  }),
});
export const eventFiltersSchema = object({
  body: object({
    filters: array(object({
      ids: array(string()).optional(),
      kinds: array(number()).optional(),
      since: number().optional(),
      until: number().optional(),
      authors: array(string()).optional(),
      limit: number().optional(),
    }))
  }),
});

export const deleteEventSchema = object({
  body: object({
    pubkey: string(),
    eventIdsToDelete: array(string()),
  }),
});

export type eventInput = TypeOf<typeof eventSchema>['body'];
export type deleteEventInput = TypeOf<typeof deleteEventSchema>['body'];
export type eventFiltersInput = TypeOf<typeof eventFiltersSchema>['body'];
