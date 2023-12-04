import { EventKinds } from '../constants/base'
import { EventId, Pubkey } from './base'

export type SubscriptionId = string

export interface SubscriptionFilter {
    ids?: EventId[]
    kinds?: EventKinds[]
    since?: number
    until?: number
    authors?: Pubkey[]
    limit?: number
    [key: `#${string}`]: string[]
}
