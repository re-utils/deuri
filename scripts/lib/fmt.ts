import pc from 'picocolors';

import { relative } from 'node:path';

import { toByte, toDuration } from './unit.ts';
import { math } from './math.ts';

export const fmt = {
  duration: (value: number) => pc.yellowBright(toDuration(value)),
  percentage: (value: number) => pc.yellowBright(math.truncate(value * 100) + '%'),
  byte: (value: number) => pc.yellowBright(toByte(value)),
  name: (name: string) => pc.bold(pc.cyan(name)),
  multiplier: (x: number) => pc.greenBright(math.truncate(x) + 'x'),
  success: pc.greenBright,
  warn: pc.yellowBright,
  error: pc.redBright,
  relativePath: (abs: string) => pc.italic(pc.underline(relative('.', abs))),
  glob: (pat: string) => `\`${pc.dim(pc.italic(pat))}\``,
  pc,
};
