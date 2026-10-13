import { bench, category } from 'measure-loop';
import run from './run.ts';

import valid from '../tests/suites/valid.json' with { type: 'json' };
import invalid from '../tests/suites/invalid.json' with { type: 'json' };

// @ts-ignore
import fastDecodeURIComponent from 'fast-decode-uri-component';
import deuri from 'deuri';

const safeDecodeURIComponent = (str: string) => {
  try {
    return decodeURIComponent(str);
  } catch {}
};

const it = (inputs: string[]) => {
  const params = [(i: number) => inputs[i % inputs.length]] as const;
  return bench()
    .it('deuri', params, deuri)
    .it('decodeURIComponent', params, safeDecodeURIComponent)
    .it('fast-decode-uri-component', params, fastDecodeURIComponent);
};

export default run(
  import.meta,
  category({
    iters: 512,
    warmupIters: 64
  })
    .it('invalid input', it(invalid))
    .it('valid input', it(valid)),
);
