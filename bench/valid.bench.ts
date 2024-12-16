import { summary, run, bench } from 'mitata';
import { decode } from '../lib/index.js';
// @ts-expect-error Stfu
import fastDecodeURIComponent from 'fast-decode-uri-component';
import data from '../suites/valid.json';

// Example benchmark
summary(() => {
  bench('deuri', () => data.map(decode));
  bench('fast-decode-uri-component', () => data.map(fastDecodeURIComponent));
  bench('Native', () => data.map(decodeURIComponent));
});

// Start the benchmark
run();
