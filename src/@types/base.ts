import net from 'net'

import mongoose from 'mongoose'

import { EventTags } from '../constants/base'

export type EventId = string
export type Pubkey = string
export type TagName = EventTags | string
export type Signature = string
export type Tag = TagBase & string[]

type ExtraTagValues = {
    [index in Range<2, 100>]?: string
}

export type Secret = string

export interface TagBase extends ExtraTagValues {
    0: TagName
    1: string
}

type Enumerate<
    N extends number,
    Acc extends number[] = [],
> = Acc['length'] extends N ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>

export type Range<F extends number, T extends number> = Exclude<
    Enumerate<T>,
    Enumerate<F>
>

export type Factory<TOutput = any, TInput = void> = (input: TInput) => TOutput

export type DatabaseClient = mongoose.Connection

export interface ContextMetadata {
    remoteAddress: net.SocketAddress
}

export interface IRunnable {
    run(): void
    close(callback?: (...args: any[]) => void): void
}
