const lengths = [1, 2, 3, 4, 5];
const words = [
  'state',
  'package',
  'valid',
  'name',
  'phrases',
  'suite',
  'length',
  'test',
  'script',
  'otherwise',
  'publish',
  'suite',
  'invalid',
  'random',
  'stringify'
];

function pick<T>(arr: T[]): T {
  return arr[Math.round(Math.random() * (arr.length - 1))];
}

function createRandomString(): string {
  return encodeURIComponent(pick(words) + new Array(pick(lengths))
    .fill(null)
    .map(() => pick(words) + String.fromCharCode(500 + Math.round(Math.random() * 1000)) + pick(words))
    .join(''));
}

await Bun.write(`${import.meta.dir}/valid.json`, JSON.stringify(Array.from({ length: 10000 }, createRandomString)));
