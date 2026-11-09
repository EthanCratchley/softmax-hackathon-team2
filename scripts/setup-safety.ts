import { loadEnvFile } from 'node:process';
import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
loadEnvFile('.env');
const live=process.argv.includes('--live');
if(!live){if(!process.env.PIEZAS_TEST_API_KEY)throw new Error('Test app is not configured');process.env.PIEZAS_API_KEY=process.env.PIEZAS_TEST_API_KEY;}
const credentialFile=live?'.env.demo-users':'.env.test-users';
if(!existsSync(credentialFile))writeFileSync(credentialFile,`SAFETY_DEMO_PASSWORD=${randomBytes(24).toString('base64url')}\n`);
loadEnvFile(credentialFile);
const {piezas,put,get}=await import('../lib/safety/store.ts');
const {seedChildren,seedGroups}=await import('../lib/safety/seed-data.ts');
const roles=[['parent','Jamie Chen'],['parent-lily','Taylor Whitfield'],['parent-owen','Grace Okafor'],['instructor','Tyler Ng'],['instructor-other','Sam Lee'],['desk','Morgan Vale'],['patrol','Casey Brooks'],['admin','Hana Sato']] as const;
const ids:Record<string,string>={};
for(const [key,name] of roles){
  const email=`${key}@example.test`;const listed=await piezas.users.listUsers({email});let user=listed.users.find(u=>u.email===email);
  if(!user)user=(await piezas.users.signUp({email,password:process.env.SAFETY_DEMO_PASSWORD!,profile:{name}})).user;
  if(user.status!=='active')await piezas.users.updateUser(user.id,{status:'active'});
  ids[key]=user.id;
  await put('member',{id:`member-${key}`,userId:user.id,role:key.startsWith('parent')?'parent':key.startsWith('instructor')?'instructor':key,name});
}
for(const g of seedGroups)await put('group',{...g,instructorId:ids[g.id==='group-1'?'instructor':'instructor-other']});
for(const c of seedChildren)if(!await get('child',c.id))await put('child',{...c,parents:[ids[c.id==='child-ava'?'parent':c.id==='child-lily'?'parent-lily':'parent-owen']]});
console.log(`${live?'Demo':'Test'} accounts and child records are ready. Password stays in the ignored local settings file.`);
