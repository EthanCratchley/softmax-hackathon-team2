import 'server-only';
import { createDemoState } from '../fixtures';
import type { KestrelServices } from './contract';
import { createMockServices } from './mock';

export type { KestrelServices, Result, ServiceError, ServiceErrorCode } from './contract';

// Mock phase: in-memory services over the synthetic seed. Swapped for the
// Piezas implementation after the design preview is approved; the interface
// does not change. Kept on globalThis so dev-server reloads keep demo edits.
const store = globalThis as typeof globalThis & { __kestrelServices?: KestrelServices };

export const services: KestrelServices = (store.__kestrelServices ??= createMockServices(createDemoState()));
