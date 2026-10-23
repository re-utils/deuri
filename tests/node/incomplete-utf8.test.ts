import { describe, it } from 'node:test';
import assert from 'node:assert';
import { unescape } from 'node:querystring';

import safeDecodeURIComponent from 'deuri';

describe('incomplete UTF-8 percent sequences', () => {
  it('matches Node for every escaped byte and pair of bytes', () => {
    const hex = Array.from({ length: 256 }, (_, byte) => `%${byte.toString(16).padStart(2, '0')}`);
    for (const first of hex) {
      assert.strictEqual(safeDecodeURIComponent(first), unescape(first), first);
      for (const second of hex) {
        const input = first + second;
        assert.strictEqual(safeDecodeURIComponent(input), unescape(input), input);
      }
    }
  });

  it('preserves valid prefixes and suffixes around interrupted sequences', () => {
    const prefixes = ['', 'left', '%41', 'left%20', '%F0%9F%98%80'];
    const incomplete = ['%C2', '%E0', '%E0%A4', '%E2%82', '%F0%9F', '%F0%9F%92'];
    const tails = ['%', '%A', '%GG', '%%41', '%G0%20', '%A%42', 'x%41', '%20', '%80', ''];
    for (const prefix of prefixes) {
      for (const sequence of incomplete) {
        for (const tail of tails) {
          const input = prefix + sequence + tail;
          assert.strictEqual(safeDecodeURIComponent(input), unescape(input), input);
        }
      }
    }
  });

  it('matches Node for deterministic ASCII inputs with mixed percent escapes', () => {
    const tokens = [
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
    ];
    let state = 0x1950;
    const random = (max: number) => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state % max;
    };
    for (let sample = 0; sample < 25000; sample++) {
      let input = '';
      for (let index = 0, length = 1 + random(8); index < length; index++) {
        input += tokens[random(tokens.length)];
      }
      assert.strictEqual(safeDecodeURIComponent(input), unescape(input), input);
    }
  });
});
