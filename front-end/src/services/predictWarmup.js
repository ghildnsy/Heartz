import { predictApi } from './api';

const WARMUP_TTL_MS = 2 * 60 * 1000;

let lastWarmupAt = 0;
let warmupPromise = null;

export function requestPredictWarmup({ force = false } = {}) {
  const now = Date.now();

  if (!force && warmupPromise) {
    return warmupPromise;
  }

  if (!force && now - lastWarmupAt < WARMUP_TTL_MS) {
    return Promise.resolve();
  }

  warmupPromise = predictApi
    .warmup()
    .then(() => {
      lastWarmupAt = Date.now();
    })
    .finally(() => {
      warmupPromise = null;
    });

  return warmupPromise;
}

export function getPredictWarmupIntervalMs() {
  return WARMUP_TTL_MS;
}
