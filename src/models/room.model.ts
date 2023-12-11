import {
  getModelForClass,
  index,
  prop,
} from '@typegoose/typegoose';

class Room {
  @prop({ index: true, })
  rid: string

  @prop()
  fname?: string

  @prop()
  name?: string

  @prop({ index: true})
  u: string

  @prop({ index: true})
  t: string
  
  @prop({ index: true})
  uids: string[]

  @prop({ index: true})
  ts: Date

  @prop()
  about: string

  @prop()
  picture: string

  @prop()
  lastMessage?: any

  @prop()
  lastMessageId?: string

  @prop({ index: true})
  lastMessageTs: number
}
const roomModel = getModelForClass(Room);

@index({ rid: 1, u: 1 }, { unique: true })
class Subscription {
  @prop({ index: true})
  rid: string;

  @prop({ index: true})
  u: string

  @prop({ index: true})
  t: string

  @prop()
  unread: number

  @prop({ index: true})
  archived?: boolean

  @prop({ index: true})
  ts: Date
}

const subscriptionModel = getModelForClass(Subscription);
export {
  roomModel,
  subscriptionModel
}