/* eslint-disable */
const hexMap = [
  ...new Array(48).fill(255),
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, // 0...9 (index 48 - 57)
  ...new Array(7).fill(255),
  10, 11, 12, 13, 14, 15, // A - F (index 65 - 70)
  ...new Array(26).fill(255),
  10, 11, 12, 13, 14, 15 // a - f (index 97 - 102)
];

const highHex = (code: number): number => code > 102 ? 255 : hexMap[code] << 4;
const lowHex = (code: number): number => code > 102 ? 255 : hexMap[code];

// Map bytes to character to a transition
const transitionType = [
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
const mask = [0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07];

/**
 * Decode the full string
 */
export const decode = (url: string): string | null => {
  let percentPosition = url.indexOf('%');
  if (percentPosition === -1) return url;

  // Ensure percentPosition always has 2 chars after
  let endSub3 = url.length - 3;
  if (percentPosition > endSub3) return null;

  let decoded = '',
    last = 0,
    codepoint = 0,
    startOfOctets = percentPosition,
    // UTF_ACCEPT
    state = 12,
    byte: number,
    type: number;

  while (true) {
    byte = highHex(url.charCodeAt(percentPosition + 1)) | lowHex(url.charCodeAt(percentPosition + 2));
    type = transitionType[byte];

    state = nextState[state + type];
    // UTF_REJECT
    if (state === 0) return null;

    codepoint = codepoint << 6 | byte & mask[type];

    // UTF_ACCEPT
    if (state === 12) {
      decoded += url.substring(last, startOfOctets);
      decoded += codepoint > 0xFFFF
        ? String.fromCharCode(
          0xD7C0 + (codepoint >> 10),
          0xDC00 + (codepoint & 0x3FF)
        )
        : String.fromCharCode(codepoint);

      // Search next encoded component
      last = percentPosition + 3;

      percentPosition = url.indexOf('%', last);
      if (percentPosition === -1)
        return decoded + url.substring(last);

      // Ensure percentPosition always has 2 chars after
      if (percentPosition > endSub3)
        return null;

      startOfOctets = percentPosition;
      codepoint = 0;
    } else {
      // Search for next %
      if (percentPosition >= endSub3 || url.charCodeAt(percentPosition + 3) !== 37) return null;
      percentPosition += 3;
    }
  }
};

/**
 * Only decode a substring
 */
export const decodeSegment = (url: string, start: number, end: number): string | null => {
  let percentPosition = url.indexOf('%', start);
  if (percentPosition === -1) return url;

  // Ensure percentPosition always has 2 chars after
  end -= 3;
  if (percentPosition > end) return null;

  start = percentPosition;
  let decoded = '',
    codepoint = 0,
    startOfOctets = percentPosition,
    // UTF_ACCEPT
    state = 12,
    byte: number,
    type: number;

  while (true) {
    byte = highHex(url.charCodeAt(percentPosition + 1)) | lowHex(url.charCodeAt(percentPosition + 2));
    type = transitionType[byte];

    state = nextState[state + type];
    // UTF_REJECT
    if (state === 0) return null;

    codepoint = codepoint << 6 | byte & mask[type];

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
      // Search for next %
      if (percentPosition >= end || url.charCodeAt(percentPosition + 3) !== 37) return null;
      percentPosition += 3;
    }
  }
};
