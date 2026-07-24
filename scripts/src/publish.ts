import { $ } from 'bun';
import { LIB } from '../lib/constants.ts';

await $`cd ${LIB} && npm publish --access=public --otp=${process.argv.at(2) ?? prompt('OTP:')}`;
