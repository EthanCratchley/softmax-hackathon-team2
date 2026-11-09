// Record kinds stored in Piezas Entity Records, shared by the app and the seed
// script. Each record's title is the app's stable id; `payload` holds the
// domain object as JSON so nested values (medications, incident actions)
// round-trip exactly.
import { createHmac } from 'node:crypto';
import type { EntityDefinition } from '@piezas/sdk';
import type { Role } from './domain/types';
import type { DemoState } from './fixtures';

export const COLLECTIONS = {
  users: 'kk_account',
  children: 'kk_child',
  medical: 'kk_medical_profile',
  contacts: 'kk_emergency_contact',
  adults: 'kk_authorized_adult',
  consents: 'kk_consent',
  groups: 'kk_lesson_group',
  attendance: 'kk_attendance',
  pickups: 'kk_pickup_log',
  corrections: 'kk_pickup_correction',
  denials: 'kk_denied_pickup',
  incidents: 'kk_incident',
  audit: 'kk_audit_event',
  noticeTasks: 'kk_notice_task',
  passes: 'kk_lesson_pass',
  passAttempts: 'kk_pass_attempt',
} as const satisfies Record<keyof DemoState, string>;

export type Collection = keyof typeof COLLECTIONS;

/** Records here are never edited or deleted once written (R-034). */
export const APPEND_ONLY: ReadonlySet<Collection> = new Set(['pickups', 'corrections', 'denials', 'audit']);

const definition: EntityDefinition = {
  fields: { key: { type: 'text', required: true }, payload: { type: 'longtext', required: true } },
};

/**
 * Record type names for the app a key belongs to. Piezas requires type names
 * to be unique across the organization, while each app (live and its test
 * copy) only sees its own types, so each uses its own prefix.
 */
export function slugsFor(apiKey: string): Record<Collection, string> {
  const prefix = apiKey.startsWith('sk_test_') ? 'kk_test_' : 'kk_live_';
  return Object.fromEntries(Object.entries(COLLECTIONS).map(([name, slug]) => [name, slug.replace(/^kk_/, prefix)])) as Record<Collection, string>;
}

/** defineEntities() input for the app a key belongs to. */
export function entityDefinitionsFor(apiKey: string): Record<string, EntityDefinition> {
  return Object.fromEntries(Object.values(slugsFor(apiKey)).map((slug) => [slug, definition]));
}

/** The stable app id of an item in a collection. */
export function keyOf(collection: Collection, item: object): string {
  const record = item as { id?: string; childId?: string };
  const key = collection === 'medical' || collection === 'consents' ? record.childId : record.id;
  if (!key) throw new Error(`${collection} item has no key`);
  return key;
}

/** Account record payload: the app user plus the Piezas users-service id it signs in as. */
export interface AccountPayload {
  id: string;
  role: Role;
  displayName: string;
  email: string;
  piezasUserId: string | null;
}

/**
 * Each demo account gets its own password, derived from one server-side
 * secret, so knowing one account's password reveals nothing about another's.
 */
export function demoPassword(secret: string, email: string): string {
  return `Kk9!${createHmac('sha256', secret).update(email.toLowerCase()).digest('base64url').slice(0, 20)}`;
}
