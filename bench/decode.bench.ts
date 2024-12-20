import { summary, run, bench } from 'mitata';

import { decode, decodeSegment } from '../lib/index.js';
// @ts-expect-error Stfu
import fastDecodeURIComponent from 'fast-decode-uri-component';

import valid from '../suites/valid.json';
import invalid from '../suites/invalid.json';
import mixed from '../suites/mixed.json';

function load(dataset: any[], prefix: string, label: string, fn: (...args: any[]) => any): void {
  bench(`${prefix} - ${label}`, () => dataset.map(fn));
}

const nativeDecode = (str: string): string | null => {
  try {
    return decodeURIComponent(str);
  } catch {
    return null;
  }
};

// No substring
summary(() => {
  const evaluate = load.bind(null, valid, 'valid');

  evaluate('deuri', decode);
  evaluate('fast-decode-uri-component', fastDecodeURIComponent);
  evaluate('native', nativeDecode);
});

// With substring
summary(() => {
  // Test this for query parsers
  const evaluate = load.bind(null, valid.map((str) => `${Math.random()}?${str}`), 'valid substring');

  evaluate(
    'fast-decode-uri-component',
    // eslint-disable-next-line
    (str: string): string | null => fastDecodeURIComponent(str.substring(str.indexOf('?')))
  );

  evaluate(
    'native',
    (str: string): string | null => nativeDecode(str.substring(str.indexOf('?')))
  );

  evaluate(
    'deuri',
    (str: string): string | null => decodeSegment(str, str.indexOf('?'), str.length)
  );

  evaluate(
    'deuri naive',
    (str: string): string | null => decode(str.substring(str.indexOf('?')))
  );
});

// Invalid
summary(() => {
  const evaluate = load.bind(null, invalid, 'invalid');

  evaluate('deuri', decode);
  evaluate('fast-decode-uri-component', fastDecodeURIComponent);
  evaluate('native', nativeDecode);
});

// Mixed
summary(() => {
  const evaluate = load.bind(null, mixed, 'mixed');

  evaluate('deuri', decode);
  evaluate('fast-decode-uri-component', fastDecodeURIComponent);
  evaluate('native', nativeDecode);
});

// Start the benchmark
run();
