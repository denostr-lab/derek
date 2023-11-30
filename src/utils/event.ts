import { FilterQuery } from "mongoose";
import {
  __,
  always,
  applySpec,
  ifElse,
  is,
  isNil,
  paths,
  pipe,
  prop,
  propSatisfies,
} from "ramda";
import { SubscriptionFilter } from "@/@types/subscription";
import { BaseEvent, DBEvent, InputEvent } from "@/@types/event";
import {
  EventDeduplicationMetadataKey,
  EventDelegatorMetadataKey,
  EventExpirationTimeMetadataKey,
} from "@/constants/base";

const toNumber = (input: number) => Number(input);
const toString = (input: string) => String(input);

const toJSON = (input: any) => {
  return input;
};
const toDate = (input: any) => {
	if (!input) {
		return null
	}
  return new Date(input);
};
export const toBuffer = (input: any) => Buffer.from(input, "hex");
export const isGenericTagQuery = (key: string) => /^#[a-zA-Z]$/.test(key);

export const normalizeEvent = (event: InputEvent): DBEvent => {
  const row: DBEvent = applySpec({
    id: pipe(prop("id"), toString),
    pubkey: pipe(prop("pubkey"), toString),
    created_at: pipe(prop("created_at"), toNumber),
    kind: pipe(prop("kind"), toNumber),
    tags: pipe(prop("tags"), toJSON),
    content: pipe(prop("content"), toString),
    sig: pipe(prop("sig"), toString),
    delegator: ifElse(
      propSatisfies(is(String), EventDelegatorMetadataKey),
      pipe(prop(EventDelegatorMetadataKey as any), toString),
      always(null)
    ),
    deduplication: ifElse(
      propSatisfies(isNil, EventDeduplicationMetadataKey),
      pipe(paths([["pubkey"], ["kind"]]), toJSON),
      pipe(prop(EventDeduplicationMetadataKey as any), toJSON)
    ),
    deleted_at: pipe(prop("deleted_at"), toDate),
    remote_address: pipe(prop("remote_address"), toJSON),
    expires_at: ifElse(
      propSatisfies(is(Number), EventExpirationTimeMetadataKey),
      prop(EventExpirationTimeMetadataKey as any),
      always(null)
    ),
  })(event);
	if (!row.deleted_at) {
		row.deleted_at = null
	}
  return row;
};
export const toNostrEvent: (event: DBEvent) => BaseEvent = applySpec({
  id: pipe(prop("id"), toString),
  kind: pipe(prop("kind"), toNumber),
  pubkey: pipe(prop("pubkey"), toString),
  created_at: pipe(prop("created_at"), toNumber),
  content: pipe(prop("content"), toString),
  tags: prop("tags"),
  sig: pipe(prop("sig"), toString),
});

export const buildMongoFilter = (filters: SubscriptionFilter[]) => {
  const filterQueries = filters.map((filter) => {
    const filterQuery: FilterQuery<DBEvent> = {};

    if (filter?.ids?.length) {
      filterQuery.id = {
        $in: filter.ids,
      };
    }

    if (filter?.authors?.length) {
      const authors = filter.authors;
      filterQuery.$or = [{ pubkey: { $in: authors } }];
    }

    if (filter?.kinds?.length) {
      filterQuery.kind = { $in: filter.kinds };
    }

    if (filter?.since) {
      filterQuery.created_at = { $gte: filter.since };
    }

    if (filter?.until) {
      if (!filterQuery.created_at) {
        filterQuery.created_at = {};
      }
      filterQuery.created_at.$lte = filter.until;
    }

    const tagFilters = Object.entries(filter)
      .filter(([filterName]) => isGenericTagQuery(filterName))
      .map(([tagName, tagValues]) => ({
        tags: {
          $elemMatch: {
            "0": tagName.slice(1),
            "1": { $in: Array.isArray(tagValues) ? [...tagValues] : [] },
          },
        },
      }));
    if (tagFilters.length > 0) {
      filterQuery.$and = tagFilters;
    }
    if (!filterQuery.$and) {
      filterQuery.$and = [];
    }

    // deletion events
    const deletionQueries = {
      deleted_at: {
        $eq: null,
      },
    };
    filterQuery.$and.push(deletionQueries);

    return filterQuery;
  });

  return filterQueries.length === 1
    ? filterQueries[0]
    : {
        $or: filterQueries,
      };
};
