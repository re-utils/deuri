import { basename, dirname, join, sep } from 'node:path';
import {
  readFileSync,
  rmSync,
  writeFileSync,
  unlinkSync as fsUnlinkSync,
  mkdirSync,
} from 'node:fs';

import { minifySync, type JsMinifyOptions } from '@swc/core';
import { transformSync, type TransformOptions } from 'oxc-transform';

import pkg from '../../package.json';

import { LIB, ROOT, SOURCE } from './constants.ts';
import { fmt } from './fmt.ts';

import { build as CONFIG } from '../config.ts';

type Evaluate<T> = { [K in keyof T]: T[K] } & {};

//
// CONFIG
//
export interface Config {
  /**
   * Transform options.
   */
  transform: TransformOptions;

  /**
   * Minify options.
   */
  minify: JsMinifyOptions;

  /**
   * File patterns to build.
   */
  files: string[];

  /**
   * File patterns to symlink.
   */
  symlinks: string[];
}

//
// MAIN
//
export const buildSourceSync = (dev: boolean, autoUpdatePkg: boolean, pathFromSource: string) => {
  const fullPath = join(SOURCE, pathFromSource);
  const outputPaths = [];

  let time = Bun.nanoseconds();
  {
    const pathNoExt = pathFromSource.slice(0, pathFromSource.lastIndexOf('.') >>> 0);
    const pathDir = dirname(pathNoExt);

    const transformed = transformSync(
      pathFromSource,
      readFileSync(fullPath, { encoding: 'utf8' }),
      CONFIG.transform,
    );

    const hasCode = transformed.code && transformed.code.trim() !== 'export {};';
    const hasDecl = transformed.declaration && transformed.declaration.trim() !== 'export {};';

    try {
      mkdirSync(join(LIB, pathDir), { recursive: true });
    } catch {}

    if (hasCode || hasDecl) {
      const pathName = basename(pathNoExt);
      const isRuntimeKey = pathName.startsWith('_');

      if (pathName === 'index' || isRuntimeKey) {
        let exportPath = dirname(pathNoExt);
        exportPath === '.' || exportPath.startsWith('./') || (exportPath = './' + exportPath);

        const sourcePath = './' + pathNoExt + (hasCode ? '.js' : '.d.ts');

        if (isRuntimeKey) {
          const runtimeKey = pathName.slice(1);

          if (typeof LIB_PKG.exports[exportPath] === 'string') {
            console.error(`Change ${exportPath}/index to ${exportPath}/_default instead!`);
            process.exit(1);
          } else
            // @ts-ignore
            (LIB_PKG.exports[exportPath] ??= {})[runtimeKey] = sourcePath;
        } else LIB_PKG.exports[exportPath] = sourcePath;

        autoUpdatePkg && updatePackageJson();
      }
    }

    // Create output files
    if (dev || hasCode) {
      const path = join(LIB, pathNoExt + '.js');
      outputPaths.push(path);

      writeFileSync(
        path,
        dev ? transformed.code : minifySync(transformed.code, CONFIG.minify).code,
      );
    }

    if (dev || hasDecl) {
      const path = join(LIB, pathNoExt + '.d.ts');
      outputPaths.push(path);

      writeFileSync(path, transformed.declaration!);
    }
  }

  time = Bun.nanoseconds() - time;
  console.log(
    fmt.success(
      '+ ' +
        (outputPaths.length > 0 ? outputPaths.map(fmt.relativePath).join(', ') + ' <-- ' : '') +
        fmt.relativePath(fullPath),
    ) +
      ': ' +
      fmt.duration(time),
  );
};

export const linkSync = (file: string) => {
  const fromFile = join(ROOT, file);
  const toFile = join(LIB, file);

  if (file.includes(sep))
    try {
      mkdirSync(dirname(toFile), { recursive: true });
    } catch {}

  let time = Bun.nanoseconds();
  try {
    writeFileSync(toFile, readFileSync(fromFile));
  } catch (e) {
    if ((e as ErrnoException).code !== 'EEXIST') {
      console.error(e);
      process.exit(1);
    }
  }
  time = Bun.nanoseconds() - time;

  console.log(
    fmt.success(`+ ${fmt.relativePath(toFile)} <-- ${fmt.relativePath(fromFile)}`) +
      ': ' +
      fmt.duration(time),
  );
};

export const unlinkSync = (file: string) => {
  const fromFile = join(ROOT, file);
  const toFile = join(LIB, file);

  let time = Bun.nanoseconds();
  fsUnlinkSync(toFile);
  time = Bun.nanoseconds() - time;

  console.log(
    fmt.error(`- ${fmt.relativePath(fromFile)} -> ${fmt.relativePath(toFile)}`) +
      ': ' +
      fmt.duration(time),
  );
};

export const removeSourceSync = (pathFromSource: string, autoUpdatePkg: boolean) => {
  let time = Bun.nanoseconds();

  try {
    const pathNoExt = pathFromSource.slice(0, pathFromSource.lastIndexOf('.') >>> 0);
    const pathName = basename(pathNoExt);

    let hasCode: boolean;
    try {
      rmSync(join(LIB, pathNoExt + '.js'));
      hasCode = true;
    } catch {
      hasCode = false;
    }

    let hasDecl: boolean;
    try {
      rmSync(join(LIB, pathNoExt + '.d.ts'));
      hasDecl = true;
    } catch {
      hasDecl = false;
    }

    if (hasCode || hasDecl) {
      const isRuntimeKey = pathName.startsWith('_');

      if (pathName === 'index' || isRuntimeKey) {
        let exportPath = dirname(pathNoExt);
        exportPath === '.' || exportPath.startsWith('./') || (exportPath = './' + exportPath);

        if (isRuntimeKey && Object.keys(LIB_PKG.exports[exportPath]).length > 1) {
          const runtimeKey = pathName.slice(1);
          // @ts-ignore
          delete LIB_PKG.exports[exportPath][runtimeKey];
        } else delete LIB_PKG.exports[exportPath];

        autoUpdatePkg && updatePackageJson();
      }
    }
  } finally {
    time = Bun.nanoseconds() - time;
    console.log(
      fmt.error('- ' + fmt.relativePath(join(SOURCE, pathFromSource))) + ':',
      fmt.duration(time),
    );
  }
};

// @ts-ignore
pkg.exports = {
  './*': './*.js',
};
// @ts-ignore
pkg.devDependencies = pkg.trustedDependencies = pkg.scripts = pkg.imports = void 0;
const LIB_PKG: Evaluate<
  Omit<
    typeof pkg,
    'devDependencies' | 'trustedDependencies' | 'scripts' | 'imports' | 'exports'
  > & { exports: Record<string, string | Record<string, string>> }
> = pkg as any;

const LIB_PACKAGE_JSON = join(LIB, 'package.json');
export const updatePackageJson = () => {
  writeFileSync(LIB_PACKAGE_JSON, JSON.stringify(LIB_PKG));
};

export const createLibDir = () => {
  try {
    rmSync(LIB, { recursive: true });
  } catch {}
  mkdirSync(LIB, { recursive: true });
};
