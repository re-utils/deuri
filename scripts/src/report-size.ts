import { minifySync, type JsMinifyOptions } from '@swc/core';

import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { LIB } from '../lib/constants.ts';
import { fmt } from '../lib/fmt.ts';

const MINIFY_OPTIONS: JsMinifyOptions = {
  mangle: true,
  compress: {
    passes: 5,
  },
  toplevel: true,
  module: true,
};

{
  //
  // MAIN
  //
  const SORT_SYMBOL = Symbol();
  const arr = globSync(process.argv.length === 2 ? ['**/*.js'] : process.argv.slice(2), {
    cwd: LIB,
  })
    // Parse entry infos
    .map((path) => {
      const code = readFileSync(join(LIB, path));
      const minifiedCode = minifySync(code, MINIFY_OPTIONS).code;

      const minifiedSize = Buffer.from(minifiedCode).byteLength;
      return {
        [SORT_SYMBOL]: minifiedSize,
        Entry: path,
        Size: code.byteLength,
        Minify: minifiedSize,
        GZIP: Bun.gzipSync(code).byteLength,
        'Minify GZIP': Bun.gzipSync(minifiedCode).byteLength,
      };
    })
    // Sort
    .sort((a, b) => a[SORT_SYMBOL] - b[SORT_SYMBOL])
    // Count total
    .reduce(
      (prev, cur) => {
        for (const key in cur)
          // @ts-ignore
          if (Number.isFinite(cur[key])) {
            // @ts-ignore
            prev[0][key] ??= 0;
            // @ts-ignore
            prev[0][key] += cur[key];
          }

        prev.push(cur);
        return prev;
      },
      [
        {
          Entry: 'Total',
        },
      ],
    )
    .reverse()
    // Convert number to byte
    .map((cur) => {
      const props = {};

      for (const key in cur)
        // @ts-ignore
        props[key] = Number.isFinite(cur[key]) ? fmt.byte(cur[key]) : cur[key];

      return props;
    });

  console.table(arr);
}
