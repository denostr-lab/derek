export type CreateRoomContent = {
  name?: string;
  about?: string;
  picture?: string;
}

export type CreateSubscription = {
  u: string;
  rid: string;
  unread: number;
  isOwner?: boolean;
}

export type StreamSubscription = {
  p: string;
  rid: string;
  unread: number;
}

export type Room = {
  rid: string;
  t: "c" | "d" | "p" | "l" | "v";
  name?: string; 
  fname?: string; 
  picture?: string;
  about?: string; 
  u: string;
  uids: string[];
  ts: Date;
  lastMessageId?: string;
  lastMessage?: any;
  lastMessageTs: number;
}

export type Subscription = {
  rid: string;
  u: string;
  unread: number;
  archived?: boolean;
  ts: Date;
}

export type ModifierRoom = {
  name?: string; 
  fname?: string; 
  picture?: string;
  about?: string; 
  uids?: string[];
  lastMessage?: any;
  lastMessageTs?: number;
  ts: Date;
}

export type ModifierSubscription = {
  unread?: number;
  archived?: boolean;
  ts?: Date;
}

export type Pagination = {
  pageNo: number;
  pageSize: number;
  sortOrder?: "desc" | "asc";
  sortBy?: string;
}

export interface SubscriptionObj {
  [rid: string]: Subscription;
}