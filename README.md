# `deuri`
Encode, decode URI components.
- Comparable speed to native in valid input cases.
- 2-3x overall faster than `fast-decode-uri-component`.
- Return `null` instead of throwing errors in invalid input cases.

```ts
import { encode, decode, decodeSegment } from 'deuri';

// Encode the full string
// Returns null if invalid
encode(url);

// Decode the full string
// Returns null if invalid
decode(url);

// Decode a substring of the input string
// Returns null if invalid
decodeSegment(url, startIndex, endIndex);
```

This implementation is an optimized version of `fast-decode-uri-component`.
