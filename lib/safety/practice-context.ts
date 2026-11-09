import { AsyncLocalStorage } from 'node:async_hooks';
import type { Group } from './model';

export type PracticeContext = { namespace: string; generation: string; groups: Group[] };
export const practiceStorage = new AsyncLocalStorage<PracticeContext>();
export function practiceContext() { return practiceStorage.getStore(); }
