import { bench, category } from 'measure-loop';
import run from './run.ts';

import valid from '../tests/suites/valid.json' with { type: 'json' };
import invalid from '../tests/suites/invalid.json' with { type: 'json' };

import { unescape } from 'node:querystring';
// @ts-ignore
import fastDecodeURIComponent from 'fast-decode-uri-component';
import deuri from 'deuri';

const all = category();
{
  const b = bench();
  all.it('valid input', b);

  const params = [(i: number) => valid[i % valid.length]] as const;

  b.it('node:querystring', params, unescape);
  b.it('deuri', params, deuri);
  b.it('fast-decode-uri-component', params, fastDecodeURIComponent);
}

{
  const b = bench();
  all.it('invalid input', b);

  const params = [(i: number) => invalid[i % invalid.length]] as const;

  b.it('node:querystring', params, unescape);
  b.it('deuri', params, deuri);
  b.it('fast-decode-uri-component', params, fastDecodeURIComponent);
}

export default run(import.meta, all);
