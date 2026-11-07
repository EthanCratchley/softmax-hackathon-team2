// Prints each demo account's email and password (derived from DEMO_ACCOUNT_SECRET).
// Local use only: share these privately, never in the repo or a public channel.
import { users } from '../lib/fixtures';
import { demoPassword } from '../lib/piezas-schema';

const secret = process.env.DEMO_ACCOUNT_SECRET;
if (!secret) {
  console.error('DEMO_ACCOUNT_SECRET is missing from .env.');
  process.exit(1);
}
for (const u of users) console.log(`${u.role.padEnd(10)} ${u.email.padEnd(30)} ${demoPassword(secret, u.email)}`);
