// Load/save of Kestrel records in Piezas. Takes the entity clients as an
// argument so the integration tests can run it against the test copy.
import type { EntityClient, EntityRecord } from '@piezas/sdk';
import type { DemoState } from '../fixtures';
import type { User } from '../domain/types';
import { APPEND_ONLY, COLLECTIONS, keyOf, type AccountPayload, type Collection } from '../piezas-schema';

export type Clients = Record<Collection, EntityClient>;

type Index = Record<Collection, Map<string, { recordId: string; json: string }>>;

export interface Loaded {
  state: DemoState;
  index: Index;
  accounts: AccountPayload[];
}

const PAGE = 100;

async function listAll(client: EntityClient): Promise<EntityRecord[]> {
  const all: EntityRecord[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const page = await client.list({ limit: PAGE, offset, sort: 'created_at', order: 'asc' });
    all.push(...page.data);
    if (page.data.length < PAGE) return all;
  }
}

const payloadOf = (record: EntityRecord) => JSON.parse(String(record.data.payload));

/** Reads every Kestrel record kind from Piezas into the in-memory shape the service logic uses. */
export async function loadState(clients: Clients): Promise<Loaded> {
  const names = Object.keys(COLLECTIONS) as Collection[];
  const lists = await Promise.all(names.map((name) => listAll(clients[name])));
  const state = {} as Record<Collection, unknown[]>;
  const index = {} as Index;
  names.forEach((name, i) => {
    index[name] = new Map();
    state[name] = lists[i].map((record) => {
      const item = payloadOf(record);
      index[name].set(keyOf(name, item), { recordId: record.id, json: JSON.stringify(item) });
      return item;
    });
  });
  const accounts = state.users as AccountPayload[];
  state.users = accounts.map(({ id, role, displayName, email }) => ({ id, role, displayName, email }) satisfies Partial<User>);
  return { state: state as unknown as DemoState, index, accounts };
}

/**
 * Writes back only what changed. Append-only kinds may gain records but never
 * have one edited or removed — enforced here because Piezas records are
 * editable with the server key.
 */
export async function commitState(clients: Clients, { state, index }: Loaded): Promise<void> {
  const writes: Promise<unknown>[] = [];
  for (const name of Object.keys(COLLECTIONS) as Collection[]) {
    if (name === 'users') continue; // accounts are managed by the seed script only
    const seen = new Set<string>();
    for (const item of state[name] as object[]) {
      const key = keyOf(name, item);
      seen.add(key);
      const json = JSON.stringify(item);
      const existing = index[name].get(key);
      if (existing?.json === json) continue;
      if (existing && APPEND_ONLY.has(name)) throw new Error(`Refused to edit append-only ${name} record ${key}`);
      const data = { key, payload: json };
      if (existing) writes.push(clients[name].update(existing.recordId, { data }));
      else writes.push(clients[name].create({ title: key, data }));
    }
    for (const [key, { recordId }] of index[name]) {
      if (seen.has(key)) continue;
      if (APPEND_ONLY.has(name)) throw new Error(`Refused to delete append-only ${name} record ${key}`);
      writes.push(clients[name].delete(recordId));
    }
  }
  await Promise.all(writes);
}

export async function findAccountByPiezasUser(clients: Clients, piezasUserId: string): Promise<AccountPayload | null> {
  const records = await listAll(clients.users);
  return records.map(payloadOf).find((a: AccountPayload) => a.piezasUserId === piezasUserId) ?? null;
}
