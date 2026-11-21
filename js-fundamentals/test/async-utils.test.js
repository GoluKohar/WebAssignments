import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retry, withTimeout, pool, sleep } from '../src/async-utils.js';

test('retry succeeds after failures', async () => {
  let calls = 0;
  const result = await retry(async () => {
    if (++calls < 3) throw new Error('flaky');
    return 'ok';
  }, { retries: 3, delayMs: 5 });

  assert.equal(result, 'ok');
  assert.equal(calls, 3);
});

test('withTimeout rejects slow work', async () => {
  await assert.rejects(withTimeout(sleep(200), 20), /Timed out/);
});

test('pool preserves order', async () => {
  const out = await pool(
    [1, 2, 3].map((n) => async () => {
      await sleep(10);
      return n;
    }),
    2,
  );

  assert.deepEqual(out, [1, 2, 3]);
});

test('retry can be cancelled with AbortSignal', async () => {
  const controller = new AbortController();
  const promise = retry(async () => {
    throw new Error('always fails');
  }, { retries: 5, delayMs: 100, signal: controller.signal });

  controller.abort();
  await assert.rejects(promise, { name: 'AbortError' });
});

test('withTimeout can be cancelled with AbortSignal', async () => {
  const controller = new AbortController();
  const promise = withTimeout(sleep(200), 100, controller.signal);

  controller.abort();
  await assert.rejects(promise, { name: 'AbortError' });
});
