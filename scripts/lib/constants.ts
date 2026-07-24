import { join, resolve } from 'node:path';
import pkg from '../../package.json';

export const SCRIPTS = resolve(import.meta.dir, '..');
export const ROOT = resolve(SCRIPTS, '..');
export const SOURCE = join(ROOT, 'src');
export const NODE_MODULES = join(ROOT, 'node_modules');
export const LIB = join(NODE_MODULES, pkg.name);
export const BENCH = join(ROOT, 'bench');
export const TESTS = join(ROOT, 'tests');
