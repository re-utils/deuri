import { describe, it } from 'node:test';
import assert from 'node:assert';

import deuri from 'deuri';
import { unescape } from 'node:querystring';

import valid from '../../suites/valid.json' with { type: 'json' };
import invalid from '../../suites/invalid.json' with { type: 'json' };

const bytes = (uri: string) => {
    const arr = new Array(uri.length);
    for (let i = 0; i < uri.length; i++) arr[i] = uri.charCodeAt(i);
    return arr;
  },
  assertMatchNode = (uri: string) =>
    assert.deepStrictEqual(bytes(deuri(uri)), bytes(unescape(uri)), uri);

describe('valid', () => {
  it('suite', () => valid.forEach(assertMatchNode));
});

describe('invalid', () => {
  it('suite', () => invalid.forEach(assertMatchNode));

  describe('incomplete sequences', () => {
    it('escaped byte and pair of bytes', () => {
      const hex = new Array(256);
      for (let i = 0; i < 256; i++)
        hex[i] = '%' + i.toString(16).padStart(2, '0');

      for (const first of hex) {
        assertMatchNode(first);
        for (const second of hex) assertMatchNode(first + second);
      }
    });

    it('preserves valid prefixes and suffixes around interrupted sequences', () => {
      for (const prefix of ['', 'left', '%41', 'left%20', '%F0%9F%98%80']) {
        for (const sequence of ['%C2', '%E0', '%E0%A4', '%E2%82', '%F0%9F', '%F0%9F%92']) {
          for (const tail of [
            '%',
            '%A',
            '%GG',
            '%%41',
            '%G0%20',
            '%A%42',
            'x%41',
            '%20',
            '%80',
            '',
          ])
            assertMatchNode(prefix + sequence + tail);
        }
      }
    });

    it('ASCII inputs with mixed percent escapes', () => {
      let SEED = 0x1950,
        SAMPLES = 25000,
        TOKENS = [
          'a',
          ' ',
          '+',
          '/',
          '%',
          '%A',
          '%GG',
          '%00',
          '%20',
          '%41',
          '%7F',
          '%80',
          '%BF',
          '%C0',
          '%C2',
          '%DF',
          '%E0',
          '%E2',
          '%EF',
          '%F0',
          '%F4',
          '%FF',
          '%9F',
          '%92',
          '%A4',
        ],
        rand = (max: number) => (SEED = (Math.imul(SEED, 1664525) + 1013904223) >>> 0) % max;

      while (SAMPLES-- > 0) {
        let uri = '';
        for (let i = 0, len = 1 + rand(8); i < len; i++) uri += TOKENS[rand(TOKENS.length)];
        assertMatchNode(uri);
      }
    });
  });
});
