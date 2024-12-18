import { test, describe, expect } from 'bun:test';
import data from '../suites/valid.json';
import { decode, decodeSegment } from '../lib/index.js';

describe('decode - must match native', () => {
  for (const uri of data) {
    test(uri, () => {
      expect(decode(uri)).toBe(decodeURIComponent(uri));
    });
  }
});

describe('decodeSegment - must match native', () => {
  for (const uri of data) {
    test(uri, () => {
      const url = `${Math.random()}?${uri}`;
      expect(decodeSegment(url, url.indexOf('?') + 1, url.length)).toBe(decodeURIComponent(uri));
    });
  }
});
