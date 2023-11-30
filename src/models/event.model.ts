import {
  DocumentType,
  getModelForClass,
  index,
  modelOptions,
  pre,
  prop,
} from '@typegoose/typegoose';
import { Tag } from '@/@types/base'

@index({ id: 1, pubkey: 1 }, { unique: true, background: true }) // compound index

@modelOptions({
  schemaOptions: {
    // Add createdAt and updatedAt fields
    timestamps: true,
  },
})

// Export the User class to be used as TypeScript type
export class Event {
  @prop({ index: true, unique: true})
  id: string;

  @prop({ index: true})
  pubkey: string

  @prop({ index: true})
  kind: number
  
  @prop({ index: true})
  created_at: number

  @prop({ index: true})
  content: string

  @prop({ index: true})
  tags: Tag[]

  @prop()
  sig: string

  @prop()
  delegator?: string

  @prop()
  deduplication?: { 0: string; 1: number }[] | null

  @prop()
  first_seen: string

  @prop()
  deleted_at?: Date

  @prop()
  expires_at?: number

  @prop()
  remote_address?: Record<string, string>
}

// Create the user model from the User class
const eventModel = getModelForClass(Event);
export default eventModel;
