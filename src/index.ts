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
  // Maps the current transition to a mask that needs to apply to the byte
  TRANSITION_MASK = [0x7f, 0x3f, 0x3f, 0x3f, 0x00, 0x1f, 0x0f, 0x0f, 0x0f, 0x07, 0x07, 0x07];

/**
 * `decodeURIComponent` without throwing errors.
 *
 * Replace invalid sequences with `0xFFFD`.
 */
export default (str: string): string => {
  var percentIdx = str.indexOf('%');
  if (percentIdx === -1) return str;

  // prevent deopts by accessing out-of-bound
  var maxPercentIdx = str.length - 3;
  if (percentIdx > maxPercentIdx) return str;

  for (let decoded = '', codepoint = 0, startIdx = 0, startOfOctets = percentIdx, state = 12; ; ) {
    let high = str.charCodeAt(percentIdx + 1),
      low = str.charCodeAt(percentIdx + 2);
    high =
      high > 47 && high < 58
        ? (high - 48) << 4 // 0123456789
        : high > 64 && high < 71
          ? (high - 55) << 4 // ABCDEF
          : high > 96 && high < 103
            ? (high - 87) << 4 // abcdef
            : 255;
    low =
      low > 47 && low < 58
        ? low - 48 // 0123456789
        : low > 64 && low < 71
          ? low - 55 // ABCDEF
          : low > 96 && low < 103
            ? low - 87 // abcdef
            : 255;

    // not meant to be an encoded character
    if (high === 255 || low === 255) {
      percentIdx = str.indexOf('%', percentIdx + 1);
    } else {
      const transition = TRANSITION[high | low];
      state = NEXT_STATE[state + transition];

      // invalid hex
      if (state === 0) {
        // append and reset state
        decoded += str.slice(startIdx, startOfOctets) + '�';
        state = 12;

        // only skip if this hex is the start
        if (percentIdx === startOfOctets) {
          // skip %xx
          startIdx = percentIdx + 3;
          percentIdx = str.indexOf('%', startIdx);
        }
        // recheck this hex as the start of a sequence
        else {
          startIdx = startOfOctets = percentIdx;
          codepoint = 0;
          continue;
        }
      } else {
        codepoint = (codepoint << 6) | ((high | low) & TRANSITION_MASK[transition]);

        // end of this sequence
        if (state === 12) {
          decoded +=
            str.slice(startIdx, startOfOctets) +
            (codepoint <= 0xffff
              ? String.fromCharCode(codepoint)
              : String.fromCharCode(0xd7c0 + (codepoint >> 10), 0xdc00 + (codepoint & 0x3ff)));

          // skip %xx
          startIdx = percentIdx + 3;
          percentIdx = str.indexOf('%', startIdx);
        }
        // check for next hex
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
