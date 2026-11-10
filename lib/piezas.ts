import 'server-only';
import { Piezas, PiezasError, type EntityClient } from '@piezas/sdk';
import manifest from '../piezas.manifest.json';
import { entityDefinitionsFor, slugsFor, type Collection } from './piezas-schema';

// The one server-side Piezas client. PIEZAS_API_KEY never leaves the server.
const store = globalThis as typeof globalThis & {
  __kestrelPiezas?: Piezas;
  __kestrelEntities?: Promise<Record<Collection, EntityClient>>;
};

interface PiezasConfiguration {
  apiKey: string;
  appId: string;
}

function configuration(): PiezasConfiguration {
  const production = process.env.NODE_ENV === 'production';
  const testKeyConfigured = !production && process.env.PIEZAS_TEST_API_KEY !== undefined;
  const key = production
    ? process.env.PIEZAS_API_KEY
    : (testKeyConfigured ? process.env.PIEZAS_TEST_API_KEY : process.env.PIEZAS_API_KEY);

  if (!key) {
    throw new Error(testKeyConfigured
      ? 'PIEZAS_TEST_API_KEY is configured but empty.'
      : 'PIEZAS_API_KEY is not set on the server.');
  }

  const keyIsTest = key.startsWith('sk_test_');
  const keyIsLive = key.startsWith('sk_live_');
  if (!keyIsTest && !keyIsLive) {
    throw new Error('Piezas configuration error: the selected API key must use the sk_test_ or sk_live_ key format.');
  }
  if (production && keyIsTest) {
    throw new Error('Piezas configuration error: production requires a live PIEZAS_API_KEY.');
  }
  if (testKeyConfigured && !keyIsTest) {
    throw new Error('Piezas configuration error: PIEZAS_TEST_API_KEY must be a test key.');
  }

  const appId = keyIsTest ? manifest.testApp?.appId : manifest.deploy?.appId;
  if (!appId) {
    throw new Error(keyIsTest
      ? 'Piezas configuration error: no test app ID is set in piezas.manifest.json.'
      : 'Piezas configuration error: no live app ID is set in piezas.manifest.json.');
  }

  return { apiKey: key, appId };
}

export function piezas(): Piezas {
  return (store.__kestrelPiezas ??= (() => {
    const config = configuration();
    return new Piezas({ apiKey: config.apiKey, appId: config.appId, apiBaseUrl: process.env.PIEZAS_API_URL });
  })());
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
  const config = configuration();
  const slugs = slugsFor(config.apiKey);
  store.__kestrelEntities ??= piezas()
    .defineEntities(entityDefinitionsFor(config.apiKey))
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
