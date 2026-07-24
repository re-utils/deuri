import { LIB, SOURCE } from './lib/constants.ts';
import { fmt } from './lib/fmt.ts';

export const test: import('./lib/test.ts').Config = {
  bun: {
    disabled: true,
    args: {
      randomize: true,
      smol: true,
      'no-clear-screen': true,
    },
  },

  node: {
    args: {
      'test-reporter': 'dot',
      'test-isolation': 'none',
    },
  },
};

export const build: import('./lib/build.ts').Config = {
  files: ['**/*.ts'],
  symlinks: ['README.md', 'LICENSE'],

  transform: {
    sourceType: 'module',
    typescript: {
      rewriteImportExtensions: true,
      declaration: {
        stripInternal: true,
      },
    },
    lang: 'ts',
  },
  minify: {
    compress: {
      module: true,
      defaults: false,
      dead_code: true,
      const_to_let: true,
      conditionals: true,
      booleans: true,
      drop_debugger: true,
      evaluate: true,
      join_vars: true,
      inline: 3,
      passes: 3,
    },
    mangle: false,
    module: true,
  },
};

export const task: import('./task.ts').Config = {
  tasks: {
    build: {
      description: `Build files matching ${build.files.map(fmt.glob).join(', ')} in ${fmt.relativePath(SOURCE)} to ${fmt.relativePath(LIB)}.`,
      args: {},
    },
    test: {
      description: `Run tests.`,
      args: {
        target: {
          type: 'string[]',
          description: 'Target tests to run. Run all tests by default.',
        },
      },
    },
    dev: {
      description: 'Watch source files and tests.',
      args: {},
    },
    publish: {
      description: `Publish ${fmt.relativePath(LIB)} to npm.`,
      args: {
        otp: {
          type: '?string',
          description: 'OTP code to authenticate. Will be prompted if ignored.',
        },
      },
    },
    'report-size': {
      description: `Report ${fmt.relativePath(LIB)} files size.`,
      args: {
        globs: {
          type: 'string[]',
          description: `Files to scan in ${fmt.relativePath(LIB)} to include in the build. Defaults to ${fmt.glob('**/*.js')}.`,
        },
      },
    },
  },
};
