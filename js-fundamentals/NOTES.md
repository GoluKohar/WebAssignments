# Assignment 1.1 Notes

## Event-loop predicted vs actual order

Before running the script, I predicted:

1. `1 sync start`
2. `2 sync inside async fn (before first await)`
3. `2b sync end`
4. `3 nextTick`
5. `4 microtask: promise.then`
6. `5 microtask: queueMicrotask`
7. `5b microtask: after await`
8. `6 macrotask: setTimeout 0`
9. `7 macrotask: setImmediate`

Actual output from Node 22:

```text
1 sync start
2 sync inside async fn (before first await)
2b sync end
4 microtask: promise.then
5 microtask: queueMicrotask
5b microtask: after await
3 nextTick
6 macrotask: setTimeout 0
7 macrotask: setImmediate
```

The synchronous lines run first, before any queued callbacks. The Promise,
queueMicrotask, and async continuation callbacks drain as microtasks. On this
run, `process.nextTick` ran after the promise and queueMicrotask callbacks
rather than before them.

In Node, `process.nextTick` is normally part of the next-tick queue and runs
before other promise microtasks. Ordering can still be surprising when promise
continuations and next-tick callbacks are scheduled together, especially from
an async IIFE. The exact ordering should be observed in the runtime and not
assumed universally.

`setTimeout(..., 0)` and `setImmediate()` are macrotasks in different Node
event-loop phases. When the script is run from the main module, their relative
order can vary; `setImmediate` is often stable in an I/O callback but not
necessarily relative to a timer scheduled at top level.

## Short answers

### CJS vs ESM

1. CJS loads and executes modules with `require()` and uses `module.exports`
   or `exports`; ESM is statically analyzed and uses `import` and `export`.
2. ESM enables top-level `await` and in modern Node can use
   `import.meta.dirname`, while CJS does not have top-level `await` and uses
   built-in `__dirname`.

### Why does `await` not block the thread?

`await` suspends only the current async function. It registers a continuation
and returns control to the call stack/event loop. The Node process remains
free to run other work while the Promise is pending.

### Why do microtasks run before `setTimeout(..., 0)`?

After JavaScript finishes a task, Node drains the microtask queue before
moving to the next macrotask. A timer callback is a macrotask, so a Promise
continuation or `queueMicrotask` callback scheduled during that task normally
runs first.