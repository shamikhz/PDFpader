import { spawnSync } from 'child_process';
import path from 'path';

// Executes the master python favicon generator
const result = spawnSync('python', ['scripts/build_favicons.py'], {
  stdio: 'inherit',
  shell: true,
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}
