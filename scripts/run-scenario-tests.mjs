import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

// Piezas' default test command quotes each scenario path with POSIX single
// quotes. PowerShell does not pass those quotes the way its Windows shell
// expects, so this wrapper forwards the selected files as native arguments.
const files = (process.env.PIEZAS_TEST_FILES ?? '')
  .split(/\r?\n/)
  .map((file) => file.trim())
  .filter(Boolean);

if (!files.length) {
  console.error('PIEZAS_TEST_FILES is empty; this runner is intended for piezas test.');
  process.exit(2);
}

const cli = resolve('node_modules/@playwright/test/cli.js');
const result = spawnSync(process.execPath, [cli, 'test', '--reporter=json', '--retries=1', ...files], {
  cwd: process.cwd(),
  env: process.env,
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024,
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
