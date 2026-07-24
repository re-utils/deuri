import { matchesGlob } from 'node:path';

export const matchesGlobs = (path: string, patterns: string[]) => {
  for (let i = 0; i < patterns.length; i++) if (matchesGlob(path, patterns[i])) return true;
  return false;
};
