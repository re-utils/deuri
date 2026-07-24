import { globSync } from 'node:fs';

import { ROOT, SOURCE } from '../lib/constants.ts';
import { buildSourceSync, linkSync, updatePackageJson, createLibDir } from '../lib/build.ts';

import { build as CONFIG } from '../config.ts';

//
// MAIN
//
createLibDir();

// Link files
for (const path of globSync(CONFIG.symlinks, {
  cwd: ROOT,
}))
  linkSync(path);

// Build files and add exports to lib/package.json
for (const path of globSync(CONFIG.files, {
  cwd: SOURCE,
}))
  buildSourceSync(false, false, path);
updatePackageJson();
