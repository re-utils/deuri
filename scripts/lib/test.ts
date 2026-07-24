import { join } from 'node:path';

import { TESTS } from './constants.ts';
import { fmt } from './fmt.ts';

import { test as CONFIG } from '../config.ts';

//
// CONFIG
//
const TARGETS = ['node', 'bun'] as const;

// Specific target options
interface SpecificConfig {
  node: {
    args?: {
      'test-isolation'?: 'none' | (string & {});
    } & Record<string, string | true>;
    files?: string[];
  };
  bun: {
    args?: {
      smol?: true;
      'no-clear-screen'?: true;
      randomize?: true;
      concurrent?: true;
    } & Record<string, string | true>;
    dirs?: string[];
  };
}
export type Config = {
  [K in (typeof TARGETS)[number]]: {
    disabled?: true;
  } & (K extends keyof SpecificConfig ? SpecificConfig[K] : {});
};

//
// MAIN
//
const NODE_DIR = join(TESTS, 'node');
const NODE_DEFAULT_PATTERNS = ['**/*.test.ts', '**/*_test.ts', '**/*.spec.ts', '**/*_spec.ts'];

const BUN_DIR = join(TESTS, 'bun');

export const testTargets = (watch: boolean, targets: readonly string[] = TARGETS) =>
  Promise.all(
    (targets.length > 0 ? targets : TARGETS).map((target) => {
      const genericConfig = CONFIG[target as (typeof TARGETS)[number]];

      // Unknown target
      if (genericConfig == null) {
        console.log('unknown target:', fmt.name(target));
        console.log('available targets:', TARGETS.map(fmt.name).join(', '));
        process.exit(1);
      }

      // Generic target configurations
      if (genericConfig.disabled) {
        console.log('target disabled:', fmt.name(target));
        return;
      }

      console.log('test target:', fmt.name(target));

      // Specific targets
      if (target === 'node') {
        const config = genericConfig as Config['node'];

        const args = ['node', '--test'];
        watch && args.push('--watch');
        config.args &&
          Object.entries(config.args).forEach(([k, v]) => {
            args.push('--' + k);
            v && v !== true && args.push(v);
          });
        args.push(...(config.files ?? NODE_DEFAULT_PATTERNS));

        return Bun.spawn(args, {
          cwd: NODE_DIR,
          stdout: 'inherit',
          stderr: 'inherit',
        }).exited;
      }

      if (target === 'bun') {
        const config = genericConfig as Config['bun'];

        const args = ['bun', 'test'];
        watch && args.push('--watch');
        config.args &&
          Object.entries(config.args).forEach(([k, v]) => {
            args.push('--' + k);
            v && v !== true && args.push(v);
          });
        config.dirs ? args.push(...config.dirs) : args.push(BUN_DIR);

        return Bun.spawn(args, {
          cwd: BUN_DIR,
          stdout: 'inherit',
          stderr: 'inherit',
        }).exited;
      }

      console.log('unhandled target:', fmt.name(target));
    }),
  );
