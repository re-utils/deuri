/* eslint-disable */
const hex: number[] = [];
for (let i = 48; i < 58; i++)
  hex[i] = i - 48;

// A - F (index 65 - 70)
// a - f (index 97 - 102)
for (let i = 0; i < 6; i++)
  // 10 to 15
  hex[i + 65] = hex[i + 97] = i + 10;

const calcHex = (a: number, b: number): number =>
  a in hex && b in hex ? hex[a] << 4 | hex[b] : 255;

// Map bytes to character to a transition
const type: number[] = [
  ...Array.from<number>({ length: 128 }).fill(0),
  ...Array.from<number>({ length: 16 }).fill(1),
  ...Array.from<number>({ length: 16 }).fill(2),
  ...Array.from<number>({ length: 32 }).fill(3),

  4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7,
  10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4
];

// Maps a state to a new state when adding a transition
const next = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96,
  0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

// Maps the current transition to a mask that needs to apply to the byte
const mask = type.map((val) => [0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07][val]);

/**
 * Decode the full string
 */
export const decode = (url: string): string | null => {
  let percentPosition = url.indexOf('%');
  if (percentPosition === -1) return url;

  // Ensure percentPosition always has 2 chars after
  const end = url.length - 3;
  if (percentPosition > end) return null;

  let decoded = '',
    start = 0,
    codepoint = 0,
    startOfOctets = percentPosition,
    // UTF_ACCEPT
    state = 12,
    byte: number

  for (; ;) {
    byte = calcHex(url.codePointAt(percentPosition + 1)!, url.codePointAt(percentPosition + 2)!);
    state = next[state + type[byte]];
    if (state === 0) return null;
    if (state === 12) {
      decoded += url.slice(start, startOfOctets);

      // Calculate current codepoint
      codepoint = codepoint << 6 | byte & mask[byte];

      decoded += codepoint > 0xFFFF
        ? String.fromCodePoint(0xD7C0 + (codepoint >> 10), 0xDC00 + (codepoint & 0x3FF))
        : String.fromCodePoint(codepoint);

      // Search next encoded component
      start = percentPosition + 3;

      percentPosition = url.indexOf('%', start);
      if (percentPosition === -1)
        return decoded + url.slice(start);

      // Ensure percentPosition always has 2 chars after
      if (percentPosition > end)
        return null;

      startOfOctets = percentPosition;
      codepoint = 0;
    } else {
      // Check next %
      percentPosition += 3;
      if (percentPosition > end || url.codePointAt(percentPosition) !== 37) return null;

      // Calculate current codepoint
      codepoint = codepoint << 6 | byte & mask[byte];
    }
  }
};

/**
* Encode URI components
*/
export const encode = (str: string): string | null => str.isWellFormed() ? encodeURIComponent(str) : null;

/**
 * Decode a substring of an input string
 */
export const decodeSegment = (url: string, start: number, end: number): string | null => {
  let percentPosition = url.indexOf('%');
  if (percentPosition === -1) return url;

  // Ensure percentPosition always has 2 chars after
  end -= 3;
  if (percentPosition > end) return null;

  let decoded = '',
    codepoint = 0,
    startOfOctets = percentPosition,
    // UTF_ACCEPT
    state = 12,
    byte: number

  for (; ;) {
    byte = calcHex(url.codePointAt(percentPosition + 1)!, url.codePointAt(percentPosition + 2)!);
    state = next[state + type[byte]];
    if (state === 0) return null;
    if (state === 12) {
      decoded += url.slice(start, startOfOctets);

      // Calculate current codepoint
      codepoint = codepoint << 6 | byte & mask[byte];

      decoded += codepoint > 0xFFFF
        ? String.fromCodePoint(0xD7C0 + (codepoint >> 10), 0xDC00 + (codepoint & 0x3FF))
        : String.fromCodePoint(codepoint);

      // Search next encoded component
      start = percentPosition + 3;

      percentPosition = url.indexOf('%', start);
      if (percentPosition === -1)
        return decoded + url.slice(start);

      // Ensure percentPosition always has 2 chars after
      if (percentPosition > end)
        return null;

      startOfOctets = percentPosition;
      codepoint = 0;
    } else {
      // Check next %
      percentPosition += 3;
      if (percentPosition > end || url.codePointAt(percentPosition) !== 37) return null;

      // Calculate current codepoint
      codepoint = codepoint << 6 | byte & mask[byte];
    }
  }
};
