import { summary, run, bench } from 'mitata';
import { decode, decodeSegment } from '../lib/index.js';
// @ts-expect-error Stfu
import fastDecodeURIComponent from 'fast-decode-uri-component';
import data from '../suites/valid.json';

// No substring
summary(() => {
  bench('deuri', () => data.map(decode));
  bench('fast-decode-uri-component', () => data.map(fastDecodeURIComponent));
  bench('native', () => data.map(decodeURIComponent));
});

// With substring
summary(() => {
  // Test this for query parsers
  const substringData = data.filter((str) => str.includes('?'));

  // eslint-disable-next-line
  const fastDecodeURIComponentSubstring = (str: string): string | null => fastDecodeURIComponent(str.substring(0, str.indexOf('?')));
  const nativeDecodeURIComponentSubstring = (str: string): string | null => decodeURIComponent(str.substring(0, str.indexOf('?')));
  const deuriSubstring = (str: string): string | null => decodeSegment(str, 0, str.indexOf('?'));

  bench('substring - deuri', () => substringData.map(deuriSubstring));
  bench('substring - fast-decode-uri-component', () => substringData.map(fastDecodeURIComponentSubstring));
  bench('substring - native', () => substringData.map(nativeDecodeURIComponentSubstring));
});

// Start the benchmark
run();
