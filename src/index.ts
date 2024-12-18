/* eslint-disable */
const hexMap: number[] = [];
for (let i = 48; i < 58; i++)
  hexMap[i] = i - 48;

// A - F (index 65 - 70)
// a - f (index 97 - 102)
for (let i = 0; i < 6; i++)
  // 10 to 15
  hexMap[i + 65] = hexMap[i + 97] = i + 10;

const calcHex = (first: number, second: number): number =>
  typeof hexMap[first] === 'number' && typeof hexMap[second] === 'number' ? hexMap[first] << 4 | hexMap[second] : 255;

// Map bytes to character to a transition
const transitionType: number[] = [
  ...new Array(128).fill(0),
  ...new Array(16).fill(1),
  ...new Array(16).fill(2),
  ...new Array(32).fill(3),

  4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7,
  10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4
];

// Maps a state to a new state when adding a transition
const nextState = [
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
const transitionMask = transitionType.map((val) => [0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07][val]);

/**
 * Decode the full string
 */
export const decode = (url: string): string | null => {
  let percentPosition = url.indexOf('%');
  if (percentPosition === -1) return url;

  // Ensure percentPosition always has 2 chars after
  let end = url.length - 3;
  if (percentPosition > end) return null;

  let decoded = '',
    start = 0,
    codepoint = 0,
    startOfOctets = percentPosition,
    // UTF_ACCEPT
    state = 12,
    byte: number

  for (; ;) {
    byte = calcHex(url.charCodeAt(percentPosition + 1), url.charCodeAt(percentPosition + 2));
    state = nextState[state + transitionType[byte]];
    // UTF_REJECT
    if (state === 0) return null;

    codepoint = codepoint << 6 | byte & transitionMask[byte];

    // UTF_ACCEPT
    if (state === 12) {
      decoded += url.substring(start, startOfOctets);
      decoded += codepoint > 0xFFFF
        ? String.fromCharCode(
          0xD7C0 + (codepoint >> 10),
          0xDC00 + (codepoint & 0x3FF)
        )
        : String.fromCharCode(codepoint);

      // Search next encoded component
      start = percentPosition + 3;

      percentPosition = url.indexOf('%', start);
      if (percentPosition === -1)
        return decoded + url.substring(start);

      // Ensure percentPosition always has 2 chars after
      if (percentPosition > end)
        return null;

      startOfOctets = percentPosition;
      codepoint = 0;
    } else {
      percentPosition += 3;
      // Search for next %
      if (percentPosition > end || url.charCodeAt(percentPosition) !== 37) return null;
    }
  }
};

/**
 * Only decode a substring
 */
export const decodeSegment = (url: string, start: number, end: number): string | null => {
  let percentPosition = url.indexOf('%');
  if (percentPosition === -1) return url;

  // Ensure percentPosition always has 2 chars after
  end -= 3;
  if (percentPosition > end) return null;

  for (let decoded = '',
    codepoint = 0,
    startOfOctets = percentPosition,
    // UTF_ACCEPT
    state = 12,
    byte: number; ;
  ) {
    byte = calcHex(url.charCodeAt(percentPosition + 1), url.charCodeAt(percentPosition + 2));
    state = nextState[state + transitionType[byte]];
    // UTF_REJECT
    if (state === 0) return null;

    codepoint = codepoint << 6 | byte & transitionMask[byte];

    // UTF_ACCEPT
    if (state === 12) {
      decoded += url.substring(start, startOfOctets);
      decoded += codepoint > 0xFFFF
        ? String.fromCharCode(
          0xD7C0 + (codepoint >> 10),
          0xDC00 + (codepoint & 0x3FF)
        )
        : String.fromCharCode(codepoint);

      // Search next encoded component
      start = percentPosition + 3;

      percentPosition = url.indexOf('%', start);
      if (percentPosition === -1)
        return decoded + url.substring(start);

      // Ensure percentPosition always has 2 chars after
      if (percentPosition > end)
        return null;

      startOfOctets = percentPosition;
      codepoint = 0;
    } else {
      percentPosition += 3;
      // Search for next %
      if (percentPosition > end || url.charCodeAt(percentPosition) !== 37) return null;
    }
  }
};
