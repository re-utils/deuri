// Map bytes to character to a transition
const TRANSITION: number[] = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7, 10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4,
  ],
  // Maps a state to a new state when adding a transition
  NEXT_STATE = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96, 0, 12, 12, 12,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 48, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  // Maps the current byte to a mask (byte & TRANSITION_MASK[TRANSITION[byte]])
  MASK = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
    50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73,
    74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97,
    98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116,
    117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
    61, 62, 63, 0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    23, 24, 25, 26, 27, 28, 29, 30, 31, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0, 1,
    2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  value = (code: number) =>
    code > 47 && code < 58
      ? code - 48 // 0123456789
      : code > 64 && code < 71
        ? code - 55 // ABCDEF
        : code > 96 && code < 103
          ? code - 87 // abcdef
          : 255,
  /**
   * `decodeURIComponent` without throwing errors, similar to `querystring.unescape()`.
   *
   * Replace invalid sequences with `U+FFFD`.
   */
  deuri = (str: string): string => {
    let percentIdx = str.indexOf('%');
    if (percentIdx === -1) return str;

    // prevent deopts by accessing out-of-bound
    let maxPercentIdx = str.length - 3;
    if (percentIdx > maxPercentIdx) return str;

    for (
      let decoded = '',
        codepoint = 0,
        startOfOctets = percentIdx,
        state = 12,
        startIdx = 0,
        high: number,
        low: number;
      ;
    ) {
      if (
        (high = value(str.charCodeAt(percentIdx + 1))) === 255 ||
        (low = value(str.charCodeAt(percentIdx + 2))) === 255
      ) {
        // not meant to be an encoded character
        percentIdx = str.indexOf('%', percentIdx + 1);
      } else {
        high = (high << 4) | low;
        state = NEXT_STATE[state + TRANSITION[high]];

        // invalid hex
        if (state === 0) {
          // append and reset state
          decoded += str.slice(startIdx, startOfOctets) + '�';
          state = 12;

          if (percentIdx === startOfOctets) {
            // find next hex if this invalid hex is the first in the sequence
            startIdx = percentIdx + 3;
            percentIdx = str.indexOf('%', startIdx);
          } else {
            // set this hex as the start of a new sequence
            startIdx = startOfOctets = percentIdx;
            codepoint = 0;
            continue;
          }
        } else {
          codepoint = (codepoint << 6) | MASK[high];

          // end of this sequence
          if (state === 12) {
            decoded +=
              str.slice(startIdx, startOfOctets) +
              (codepoint <= 0xffff
                ? String.fromCharCode(codepoint)
                : String.fromCharCode(0xd7c0 | (codepoint >> 10), 0xdc00 | (codepoint & 0x3ff)));

            // skip %xx
            startIdx = percentIdx + 3;
            percentIdx = str.indexOf('%', startIdx);
          }
          // check next hex
          else {
            // skip %xx
            percentIdx += 3;

            // missing next hex
            if (str.charCodeAt(percentIdx) !== 37) {
              // append and reset state
              decoded += str.slice(startIdx, startOfOctets) + '�';
              state = 12;

              startIdx = percentIdx;
              percentIdx = str.indexOf('%', startIdx + 1);
            }
            // not meant to be an encoded character
            else if (percentIdx > maxPercentIdx) return decoded + str.slice(startIdx);
            else continue;
          }
        }
      }

      // Check if percentIdx is valid
      if (percentIdx === -1 || percentIdx > maxPercentIdx) return decoded + str.slice(startIdx);

      startOfOctets = percentIdx;
      codepoint = 0;
    }
  };
export default deuri;
