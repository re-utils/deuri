# `fast-duc`
A fast alternative to native `decodeURIComponent`.

```ts
import { decode, decodeSegment } from 'fast-duc';

// Decode the full string
// Returns null if invalid
decode(url);

// Decode a substring of the input string
// Returns null if invalid
decodeSegment(url, startIndex, endIndex);
```
