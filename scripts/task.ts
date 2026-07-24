import { join } from 'node:path';

import { SCRIPTS } from './lib/constants.ts';
import { fmt } from './lib/fmt.ts';
import { task as CONFIG } from './config.ts';

//
// TYPES
//
interface Task {
  description: string;
  args: Record<
    string,
    {
      type:
        | 'string'
        | 'number'
        | '?bool'
        | 'string[]'
        | 'number[]'
        | '?string'
        | '?number'
        | (string & {});
      description: string;
      flag?: true;
    }
  >;
}

export interface Config {
  tasks: Record<string, Task>;
}

{
  //
  // MAIN
  //
  const TASKS = CONFIG.tasks;

  const printHelp = (name: string, task: Task) => {
    const entries = Object.entries(task.args);

    console.log(
      `\n  ${fmt.pc.bold('bun task')} ${fmt.name(name)}${entries
        .map(([k, v]) => {
          v.type.endsWith('[]') ? (k = '...' + k) : v.flag && (k = '--' + k);
          return ' ' + fmt.pc.bold(`[${k}]`);
        })
        .join('')}: ${task.description}`,
    );

    for (const entry of entries)
      console.log(
        `    ${fmt.pc.bold(fmt.pc.dim(entry[0]))}: ${fmt.pc.bold(fmt.pc.yellowBright(entry[1].type))}: ${entry[1].description}`,
      );
  };

  const task = process.argv[2];
  if (task == null || !(task in TASKS)) {
    if (task === 'help') {
      const askedTask = process.argv[3];
      if (askedTask != null) {
        if (askedTask in TASKS) {
          printHelp(askedTask, TASKS[askedTask]);
          process.exit(0);
        } else {
          console.log('unknown task:', fmt.name(askedTask));
          console.log('available tasks:', Object.keys(TASKS).map(fmt.name).join(', '));
          process.exit(1);
        }
      }
    }

    console.log(
      `  ${fmt.pc.bold('configurations')}: ${fmt.relativePath(join(SCRIPTS, 'config.ts'))}`,
    );

    // Print all tasks
    printHelp('help', {
      description: 'Print help menu.',
      args: {
        task: {
          type: '?string',
          description: 'Print help menu of the specified task. Print all tasks by default.',
        },
      },
    });
    for (const name in TASKS) printHelp(name, TASKS[name]);

    process.exit(0);
  }

  Bun.gc(true);
  Bun.spawnSync(
    [process.execPath, join(SCRIPTS, 'src', task + '.ts')].concat(process.argv.slice(3)),
    {
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
    },
  );
}
