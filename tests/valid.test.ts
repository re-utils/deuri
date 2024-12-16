import { test, describe, expect } from 'bun:test';
import data from '../suites/valid.json';
import { decode } from '../lib/index.js';

describe('Must match native', () => {
  for (const uri of data) {
    test(uri, () => {
      expect(decode(uri)).toBe(decodeURIComponent(uri));
    });
  }
});
