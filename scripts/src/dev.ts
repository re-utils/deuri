import { watch } from 'chokidar';

import { ROOT, SOURCE } from '../lib/constants.ts';
import {
  buildSourceSync,
  linkSync,
  updatePackageJson,
  removeSourceSync,
  createLibDir,
} from '../lib/build.ts';
import { testTargets } from '../lib/test.ts';
import { matchesGlobs } from '../lib/fs.ts';

import { build as BUILD_CONFIG } from '../config.ts';
import { globSync } from 'node:fs';

//
// BUILD
//
createLibDir();

// Link files
for (const path of globSync(BUILD_CONFIG.symlinks, {
  cwd: ROOT,
}))
  linkSync(path);

// Build files and add exports to lib/package.json
for (const path of globSync(BUILD_CONFIG.files, {
  cwd: SOURCE,
}))
  buildSourceSync(true, false, path);
updatePackageJson();

watch('.', {
  ignored: (path, stats) => !!stats?.isFile() && !matchesGlobs(path, BUILD_CONFIG.files),
  cwd: SOURCE,
  interval: 100,
  ignoreInitial: true,
})
  .on('add', (path) => {
    buildSourceSync(true, true, path);
  })
  .on('change', (path) => {
    buildSourceSync(true, false, path);
  })
  .on('unlink', (path) => {
    removeSourceSync(path, true);
  })
  .on('error', (e) => {
    console.error(e);
  });

testTargets(true);
