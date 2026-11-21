import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCounter, memoize } from '../src/closures.js';
import { TaskQueue } from '../src/task-queue.js';

test('makeCounter keeps private state', () => {
  const counter = makeCounter(5);
  assert.equal(counter.inc(), 6);
  assert.equal(counter.dec(), 5);
  assert.equal(counter.value, 5);
});

test('memoize caches arguments and avoids repeated calls', () => {
  let calls = 0;
  const double = memoize((value) => {
    calls++;
    return value * 2;
  });

  assert.equal(double(3), 6);
  assert.equal(double(3), 6);
  assert.equal(double(4), 8);
  assert.equal(calls, 2);
});

test('TaskQueue runs in order and clears itself', async () => {
  const order = [];
  const queue = new TaskQueue('demo');

  queue
    .push(async () => {
      await Promise.resolve();
      order.push('first');
      return 1;
    })
    .push(async () => {
      order.push('second');
      return 2;
    });

  assert.equal(queue.size, 2);
  assert.deepEqual(await queue.runAll(), [1, 2]);
  assert.deepEqual(order, ['first', 'second']);
  assert.equal(queue.size, 0);
});
