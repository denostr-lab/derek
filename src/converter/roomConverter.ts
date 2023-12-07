import { Room, SubscriptionObj } from '@/types';
export function roomConverter(roomList: Room[], subscriptionObj: SubscriptionObj) {
  roomList.map((room: Room) => {
    const subscription = subscriptionObj[room.rid];
    return {
      ...room,
      subscription
    }
  })
}