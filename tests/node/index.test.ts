import { describe, it } from 'node:test';
import assert from 'node:assert';

import safeDecodeURIComponent from 'deuri';
import { unescape } from 'node:querystring';

import valid from '../suites/valid.json' with { type: 'json' };
import invalid from '../suites/invalid.json' with { type: 'json' };

describe('valid', () => {
  for (const uri of valid) {
    it(uri, () => {
      assert.strictEqual(safeDecodeURIComponent(uri), decodeURIComponent(uri));
    });
  }
});

describe('invalid', () => {
  for (const uri of invalid)
    it(uri, () => {
      assert.throws(() => decodeURIComponent(uri));
      assert.strictEqual(safeDecodeURIComponent(uri), unescape(uri));
    });
});
