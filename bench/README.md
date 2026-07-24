To run the benchmark:
```sh
# node
node --expose-gc decode.ts

# deno (need env to detect colors)
deno --v8-flags=--expose-gc --allow-env decode.ts

# bun
bun decode.ts
```
