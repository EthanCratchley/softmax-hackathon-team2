import 'server-only';
import { Piezas, type EntityClient } from '@piezas/sdk';
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

/** Defines the record kinds once per server process (idempotent) and returns their clients. */
export function entities(): Promise<Record<Collection, EntityClient>> {
  const slugs = slugsFor(apiKey());
  store.__kestrelEntities ??= piezas()
    .defineEntities(entityDefinitionsFor(apiKey()))
    .then((clients) =>
      Object.fromEntries(Object.entries(slugs).map(([name, slug]) => [name, clients[slug]])) as Record<Collection, EntityClient>,
    );
  store.__kestrelEntities.catch(() => (store.__kestrelEntities = undefined));
  return store.__kestrelEntities;
}
