export function sleep(ms, options = {}) {
  const signal = options instanceof AbortSignal ? options : options.signal;

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    let timer;
    const onAbort = () => {
      clearTimeout(timer);
      reject(createAbortError());
    };
    timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function createAbortError() {
  return new DOMException('The operation was aborted', 'AbortError');
}

function getSignal(signalOrOptions) {
  return signalOrOptions instanceof AbortSignal
    ? signalOrOptions
    : signalOrOptions?.signal;
}

export async function retry(fn, { retries = 3, delayMs = 100, signal } = {}) {
  if (signal?.aborted) throw createAbortError();

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) throw createAbortError();

    try {
      return await fn(attempt, signal);
    } catch (err) {
      if (signal?.aborted) throw createAbortError();
      lastError = err;
      if (attempt < retries) await sleep(delayMs * 2 ** attempt, signal);
    }
  }
  throw lastError;
}

export function withTimeout(promise, ms, signalOrOptions = {}) {
  const signal = getSignal(signalOrOptions);
  if (signal?.aborted) return Promise.reject(createAbortError());

  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });

  const work = Promise.resolve(promise);
  const abort = signal
    ? new Promise((_, reject) => {
        signal.addEventListener('abort', () => reject(createAbortError()), { once: true });
      })
    : new Promise(() => {});

  return Promise.race([work, timeout, abort]).finally(() => clearTimeout(timer));
}

export async function pool(tasks, limit = 2) {
  const results = new Array(tasks.length);
  let next = 0;

  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, () => worker()),
  );
  return results;
}
