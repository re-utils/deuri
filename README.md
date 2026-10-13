`decodeURIComponent` without throwing errors.

```ts
import deuri from 'deuri';

deuri('hello%20world'); // 'hello world'
deuri('%C3%28'); // '�('
```

Invalid sequences are replaced with `U+FFFD` character, which matches `node:querystring` `unescape()` behavior.

The algorithm was tuned from `fast-decode-uri-component` to improve performance and support replacing invalid sequences.
