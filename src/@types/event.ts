import mongoose, { ObjectId } from 'mongoose'

import { ContextMetadataKey, EventDeduplicationMetadataKey, EventDelegatorMetadataKey, EventExpirationTimeMetadataKey, EventKinds } from '../constants/base'
import { ContextMetadata, EventId, Pubkey, Tag } from './base'

export interface BaseEvent {
    id: EventId
    pubkey: Pubkey
    created_at: number
    kind: EventKinds
    tags?: string[][]
    sig: string
    content: string
}

export interface Event extends BaseEvent {
    [ContextMetadataKey]?: ContextMetadata
}
export interface InputEvent extends BaseEvent {
    remote_address?: {
        address?: string
        family?: string
        port?: number
        flowlabel?: number
    }
}
export type RelayedEvent = Event

export type UnsignedEvent = Omit<Event, 'sig'>

export type UnidentifiedEvent = Omit<UnsignedEvent, 'id'>

export interface DelegatedEvent extends Event {
    [EventDelegatorMetadataKey]?: Pubkey
}

export interface ExpiringEvent extends Event {
    [EventExpirationTimeMetadataKey]?: number
}

export interface ParameterizedReplaceableEvent extends Event {
    [EventDeduplicationMetadataKey]: string[]
}

export interface DBEvent {
    // _id?: ObjectId
    id: string
    pubkey: string
    kind: number
    created_at: number
    content: string
    tags: Tag[]
    sig: string
    delegator?: string | null
    deduplication?: { 0: string; 1: number }[] | null
    first_seen?: string
    deleted_at?: Date | string | null
    expires_at?: number
}

export interface CanonicalEvent {
    0: 0
    1: string
    2: number
    3: number
    4: Tag[]
    5: string
}
