import { identity, sameOrigin, errorResponse, allow } from '@/lib/safety/auth';
import { command, view } from '@/lib/safety/service';
import { withPractice } from '@/lib/safety/practice';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const who=await identity(true);allow(who,['instructor','patrol']);return Response.json(await withPractice(()=>view(who,new URL(request.url).searchParams.get('day')||'')),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
export async function POST(request:Request){try{sameOrigin(request);const who=await identity(true);allow(who,['instructor','patrol']);const body=await request.json();return Response.json(await withPractice(()=>command(who,body)),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
