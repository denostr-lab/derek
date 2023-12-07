import { RoomList } from '@/types';
export function roomListConverter(roomList: RoomList[]) {
  const list = roomList.map((room: RoomList) => {
    delete room?.roomData?.lastMessage?.remote_address;
    return room
  })

  return list;
}