import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const major = Number(process.versions.node.split('.')[0]);
const docusaurus = fileURLToPath(
  new URL('../node_modules/@docusaurus/core/bin/docusaurus.mjs', import.meta.url),
);
const nodeArgs = major >= 25 ? ['--no-experimental-webstorage'] : [];
const result = spawnSync(process.execPath, [...nodeArgs, docusaurus, 'build'], {
  stdio: 'inherit',
});

if (result.error !== undefined) throw result.error;
process.exitCode = result.status ?? 1;
