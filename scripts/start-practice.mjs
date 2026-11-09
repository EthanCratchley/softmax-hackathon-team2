import { loadEnvFile } from 'node:process';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { Piezas } from '@piezas/sdk';

loadEnvFile('.env');
loadEnvFile('.env.practice');
const expected = process.env.SAFETY_PRACTICE_APP_ID;
const namespace = process.env.SAFETY_PRACTICE_NAMESPACE;
const manifest = JSON.parse(readFileSync('piezas.manifest.json', 'utf8'));
if (process.env.SAFETY_PRACTICE_ENABLED !== 'true' || !expected || !namespace ||
    !/^[a-z][a-z0-9_]{15,39}$/.test(namespace) || !process.env.PIEZAS_TEST_API_KEY) {
  throw new Error('Configure the private practice environment before starting it.');
}
const identity = await new Piezas({ apiKey: process.env.PIEZAS_TEST_API_KEY, apiBaseUrl: process.env.PIEZAS_API_URL }).whoami();
if (identity.authError || identity.keyMode !== 'test' || identity.keyAppId !== expected ||
    identity.appId !== expected || expected === manifest.deploy?.appId) {
  throw new Error('Practice configuration does not match a verified test app. Nothing was reset.');
}
console.log('Starting isolated instructor/patrol practice at http://localhost:3102. Normal app settings are unchanged.');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', '3102'], {
  stdio: 'inherit', windowsHide: true,
  env: { ...process.env, PIEZAS_API_KEY: process.env.PIEZAS_TEST_API_KEY },
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.on('exit', code => { process.exitCode = code ?? 1; });
process.on('SIGINT', () => server.kill());
process.on('SIGTERM', () => server.kill());
