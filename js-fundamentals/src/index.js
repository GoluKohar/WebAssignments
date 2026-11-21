import { createRequire } from 'node:module';
import { sleep } from './async-utils.js';

const require = createRequire(import.meta.url);
const { add } = require('./legacy.cjs');

console.log('CJS add:', add(2, 3));
console.log('start');
await sleep(100);
console.log('done after 100ms');
