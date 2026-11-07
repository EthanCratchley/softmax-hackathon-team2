import 'server-only';
import { Piezas, PiezasError, type EntityClient } from '@piezas/sdk';
import { entityDefinitionsFor, slugsFor, type Collection } from './piezas-schema';

// The one server-side Piezas client. PIEZAS_API_KEY never leaves the server.
const store = globalThis as typeof globalThis & {
  __kestrelPiezas?: Piezas;
  __kestrelEntities?: Promise<Record<Collection, EntityClient>>;
};

function apiKey(): string {
  // Development servers use the TEST copy so local work never touches live data.
  const key = process.env.NODE_ENV === 'production' ? process.env.PIEZAS_API_KEY : (process.env.PIEZAS_TEST_API_KEY ?? process.env.PIEZAS_API_KEY);
  if (!key) throw new Error('PIEZAS_API_KEY is not set on the server.');
  return key;
}

export function piezas(): Piezas {
  return (store.__kestrelPiezas ??= new Piezas({ apiKey: apiKey(), apiBaseUrl: process.env.PIEZAS_API_URL }));
}

/**
 * Looks the record kinds up when defineEntities reports they already exist
 * (it can 409 on types created earlier by another key for this app). Logs the
 * key's scope (no secrets) if they still cannot be found.
 */
async function adoptExisting(slugs: Record<Collection, string>): Promise<Record<Collection, EntityClient>> {
  const client = piezas();
  const schemas = await client.entities.listSchemas();
  const missing = Object.values(slugs).filter((slug) => !schemas.some((s) => s.slug === slug));
  if (missing.length) {
    const who = await client.whoami();
    console.error('Kestrel record types not visible to this key', { appId: who.appId, keyAppId: who.keyAppId, keyMode: who.keyMode, role: who.role, visible: schemas.length, missing });
    throw new Error(`Record types not visible to this server's Piezas key: ${missing.join(', ')}`);
  }
  return Object.fromEntries(
    Object.entries(slugs).map(([name, slug]) => {
      const schema = schemas.find((s) => s.slug === slug)!;
      return [name, client.entities.ofType(schema.id, slug)];
    }),
  ) as Record<Collection, EntityClient>;
}

/** Defines the record kinds once per server process (idempotent) and returns their clients. */
export function entities(): Promise<Record<Collection, EntityClient>> {
  const slugs = slugsFor(apiKey());
  store.__kestrelEntities ??= piezas()
    .defineEntities(entityDefinitionsFor(apiKey()))
    .then(
      (clients) => Object.fromEntries(Object.entries(slugs).map(([name, slug]) => [name, clients[slug]])) as Record<Collection, EntityClient>,
      (error: unknown) => {
        if (error instanceof PiezasError && error.code === 'conflict') return adoptExisting(slugs);
        throw error;
      },
    );
  store.__kestrelEntities.catch(() => (store.__kestrelEntities = undefined));
  return store.__kestrelEntities;
}
