import 'server-only';
import { entities } from '../piezas';
import * as store from './record-store';

export type { Loaded } from './record-store';

export const loadState = async () => store.loadState(await entities());
export const commitState = async (loaded: store.Loaded) => store.commitState(await entities(), loaded);
export const findAccountByPiezasUser = async (piezasUserId: string) => store.findAccountByPiezasUser(await entities(), piezasUserId);
