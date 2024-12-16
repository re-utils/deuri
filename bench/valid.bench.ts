import { summary, run, bench } from 'mitata';
import { decode } from '../lib/index.js';
import data from './valid.json';

// Example benchmark
summary(() => {
  bench('Custom', () => data.map(decode));
  bench('Native', () => data.map(decodeURIComponent));
});

// Start the benchmark
run();
