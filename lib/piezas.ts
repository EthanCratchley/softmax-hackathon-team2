import 'server-only';
import { Piezas, type EntityClient } from '@piezas/sdk';
import { COLLECTIONS, ENTITY_DEFINITIONS, type Collection } from './piezas-schema';

// The one server-side Piezas client. PIEZAS_API_KEY never leaves the server.
const store = globalThis as typeof globalThis & {
  __kestrelPiezas?: Piezas;
  __kestrelEntities?: Promise<Record<Collection, EntityClient>>;
};

export function piezas(): Piezas {
  const apiKey = process.env.PIEZAS_API_KEY;
  if (!apiKey) throw new Error('PIEZAS_API_KEY is not set on the server.');
  return (store.__kestrelPiezas ??= new Piezas({ apiKey, apiBaseUrl: process.env.PIEZAS_API_URL }));
}

/** Defines the record kinds once per server process (idempotent) and returns their clients. */
export function entities(): Promise<Record<Collection, EntityClient>> {
  store.__kestrelEntities ??= piezas()
    .defineEntities(ENTITY_DEFINITIONS)
    .then((clients) =>
      Object.fromEntries(Object.entries(COLLECTIONS).map(([name, slug]) => [name, clients[slug]])) as Record<Collection, EntityClient>,
    );
  store.__kestrelEntities.catch(() => (store.__kestrelEntities = undefined));
  return store.__kestrelEntities;
}
