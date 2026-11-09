import { cookies } from 'next/headers';
import { all, piezas } from './store';
import type { Member, Role } from './model';
export class AppError extends Error { constructor(message:string,public status=400){super(message);} }
export function sessionCookieName() {
  if(process.env.SAFETY_PRACTICE_ENABLED!=='true')return 'kestrel-session';
  const namespace=process.env.SAFETY_PRACTICE_NAMESPACE;
  return `kestrel-practice-${namespace&&/^[a-z][a-z0-9_]{15,39}$/.test(namespace)?namespace:'unconfigured'}`;
}
export async function identity(refresh=false) {
  const jar=await cookies(); const token=jar.get(sessionCookieName())?.value;
  if(!token) throw new AppError('Please sign in.',401);
  const verified=await piezas.users.getSession(token);
  if(!verified.valid || !verified.user || !verified.claims) throw new AppError('Please sign in again.',401);
  const member=(await all<Member>('member')).find(m=>m.userId===verified.user!.id);
  if(!member)throw new AppError('Your account has no assigned access. Contact Hana.',403);
  if(refresh&&verified.refreshedToken) jar.set(sessionCookieName(),verified.refreshedToken,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'});
  return {...member,tenantId:verified.claims.tenantId,email:verified.user.email};
}
export type Identity=Awaited<ReturnType<typeof identity>>;
export function allow(who:Identity,roles:Role[]) { if(!roles.includes(who.role)) throw new AppError('Not found',404); }
export function sameOrigin(request:Request) { if(request.headers.get('origin')!==new URL(request.url).origin) throw new AppError('Please reload and try again.',403); }
export function errorResponse(error:unknown) {
  if(error instanceof AppError)return Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'no-store'}});
  const serviceError=error as {name?:string;code?:string;status?:number;operation?:string};
  console.error('Safety service unavailable',serviceError.name,serviceError.code,serviceError.status,serviceError.operation);
  return Response.json({error:'The service could not save or load this information. Try again; use the radio for urgent help.'},{status:503});
}
