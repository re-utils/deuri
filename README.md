A fast percent decoding method like `decodeURIComponent` without throwing errors.

```ts
import deuri from 'deuri';

deuri('hello%20world'); // 'hello world'
deuri('%C3%28'); // '�('
```

Invalid sequences are replaced with `U+FFFD` character, which matches `node:querystring` `unescape()` method behavior.

## Performance
`deuri` is ~1.5x faster than native `decodeURIComponent` and 2x faster than `fast-decode-uri-component` at decoding inputs with valid sequences.

For inputs with invalid sequences, `deuri` is ~1.1x faster than `fast-decode-uri-component` and ~70x faster than native `decodeURIComponent` (as it throws).

Run the benchmarks in [bench](./bench) directory on Github if you want to verify the result yourself.

## Credits
The algorithm was tuned from `fast-decode-uri-component` to improve performance and support replacing invalid sequences.
