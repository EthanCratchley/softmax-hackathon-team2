import { redirect } from 'next/navigation';
import { identity } from '@/lib/safety/auth';
export const dynamic='force-dynamic';
export default async function Home(){
  let role;
  try{role=(await identity()).role;}catch{redirect('/login');}
  if(role==='instructor'||role==='patrol')redirect(`/${role}`);
  return <main><h1>This workspace is coming from your team.</h1><p>This build contains the instructor and patrol experiences. Parent, desk, and admin workspaces will be added during team integration.</p><a href="/login">Return to sign in</a></main>;
}
