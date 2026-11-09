import { cookies } from 'next/headers';
import { piezas } from '@/lib/safety/store';
import { errorResponse, sameOrigin, AppError, identity, sessionCookieName } from '@/lib/safety/auth';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await identity(true),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
export async function POST(request:Request){try{
  sameOrigin(request);const body=await request.json();
  if(body.action==='logout'){const jar=await cookies();const token=jar.get(sessionCookieName())?.value;if(token)await piezas.users.signOut(token);jar.delete(sessionCookieName());return Response.json({ok:true});}
  const result=body.challenge ? await piezas.users.completeMfaChallenge(String(body.challenge),String(body.code)) : await piezas.users.signIn({email:String(body.email),password:String(body.password)});
  if(result.mfa)return Response.json({challenge:result.mfa.challengeToken});
  if(!result.session)throw new AppError('Sign-in did not complete. Try again.',401);
  (await cookies()).set(sessionCookieName(),result.session.token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',expires:new Date(result.session.expiresAt)});
  return Response.json({ok:true});
}catch(e){if(e instanceof AppError)return errorResponse(e);return Response.json({error:'Sign-in failed. Check your details and account activation, then try again.'},{status:401});}}
