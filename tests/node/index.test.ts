import { describe, it } from 'node:test';
import assert from 'node:assert';

import deuri from 'deuri';
import { unescape } from 'node:querystring';

import valid from '../suites/valid.json' with { type: 'json' };
import invalid from '../suites/invalid.json' with { type: 'json' };

describe('valid', () => {
  for (const uri of valid)
    it(uri, () => {
      assert.strictEqual(deuri(uri), decodeURIComponent(uri));
    });
});

describe('invalid', () => {
  for (const uri of invalid) {
    assert.throws(() => decodeURIComponent(uri));
    it(uri, () => {
      assert.strictEqual(deuri(uri), unescape(uri));
    });
  }
});
