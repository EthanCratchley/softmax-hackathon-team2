import 'server-only';
import { createDemoState } from '../fixtures';
import type { KestrelServices } from './contract';
import { createMockServices } from './mock';
import { commitState, loadState } from './piezas-store';

export type { KestrelServices, Result, ServiceError, ServiceErrorCode } from './contract';

type Method = keyof KestrelServices;
type Call = (...args: unknown[]) => Promise<unknown>;

/**
 * Piezas-backed services: each call loads the Kestrel records, runs the same
 * authorization and business logic the unit tests cover (lib/services/mock.ts),
 * then writes back only what changed. Calls are serialized within the server
 * process so two requests never interleave a read-modify-write.
 */
function createPiezasServices(): KestrelServices {
  let queue: Promise<unknown> = Promise.resolve();
  const methods = Object.keys(createMockServices(createDemoState())) as Method[];
  return Object.fromEntries(
    methods.map((method) => [
      method,
      (...args: unknown[]) => {
        const next = queue.then(async () => {
          const loaded = await loadState();
          const result = await (createMockServices(loaded.state)[method] as Call)(...args);
          await commitState(loaded);
          return result;
        });
        queue = next.catch(() => undefined);
        return next;
      },
    ]),
  ) as unknown as KestrelServices;
}

// KESTREL_DATA=mock keeps everything in server memory for local UI work
// without a Piezas key. Never allowed in a production build.
const useMock = process.env.KESTREL_DATA === 'mock' && process.env.NODE_ENV !== 'production';
const store = globalThis as typeof globalThis & { __kestrelServices?: KestrelServices };

export const services: KestrelServices = (store.__kestrelServices ??= useMock
  ? createMockServices(createDemoState())
  : createPiezasServices());
