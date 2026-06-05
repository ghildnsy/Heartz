import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

const USE_DEV_PROXY = import.meta.env.DEV && import.meta.env.VITE_USE_API_PROXY === 'true';
const BASE_URL = USE_DEV_PROXY ? '' : rawBaseUrl.replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  validateStatus: () => true,
});

let accessToken = null;
let authExpiredHandler = null;
let refreshPromise = null;

function getToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
}

export function clearAccessToken() {
  accessToken = null;
}

export function onAuthExpired(handler) {
  authExpiredHandler = typeof handler === 'function' ? handler : null;

  return () => {
    if (authExpiredHandler === handler) {
      authExpiredHandler = null;
    }
  };
}

function notifyAuthExpired() {
  clearAccessToken();
  if (authExpiredHandler) {
    authExpiredHandler();
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  return {
    ...config,
    headers: {
      ...config.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export class ApiError extends Error {
  constructor(message, statusCode, code, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

function isFailurePayload(json) {
  return json?.status === 'error' || json?.status === 'fail';
}

function getAccessTokenFromPayload(json) {
  return json?.accessToken || json?.data?.accessToken || json?.data?.token || null;
}

function normalizeResponseData(json) {
  const accessToken = getAccessTokenFromPayload(json);

  if (accessToken) {
    const data = json?.data && !Array.isArray(json.data) ? json.data : {};
    return {
      ...data,
      accessToken,
      token: accessToken,
    };
  }

  return json?.data ?? null;
}

async function tryRefresh() {
  try {
    await refreshAccessToken();
    return true;
  } catch {
    return false;
  }
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await apiClient.post('/api/auth/refresh');
      const json = response.data;
      const token = getAccessTokenFromPayload(json);

      if (response.status < 200 || response.status >= 300 || isFailurePayload(json)) {
        throw new ApiError(
          json?.message || 'Sesi tidak valid, silakan login ulang.',
          response.status,
          json?.code,
          json?.errors
        );
      }

      if (token) {
        setAccessToken(token);
      }
      return normalizeResponseData(json);
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await apiClient({
      url: path,
      method: options.method || 'GET',
      data: options.data ?? options.body,
      headers: options.headers,
      params: options.params,
    });
  } catch {
    throw new ApiError('Koneksi gagal. Pastikan server Heartz cloud dapat dijangkau.', 0);
  }

  if (response.status === 401 && !path.startsWith('/api/auth')) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      response = await apiClient({
        url: path,
        method: options.method || 'GET',
        data: options.data ?? options.body,
        headers: options.headers,
        params: options.params,
      });
    } else {
      notifyAuthExpired();
    }
  }

  const json = response.data;

  if (response.status < 200 || response.status >= 300 || isFailurePayload(json)) {
    throw new ApiError(
      json?.message || 'Terjadi kesalahan pada server.',
      response.status,
      json?.code,
      json?.errors
    );
  }

  return normalizeResponseData(json);
}

export const authApi = {
  register: (body) =>
    request('/api/auth/register', {
      method: 'POST',
      data: body,
    }),

  login: (body) =>
    request('/api/auth/login', {
      method: 'POST',
      data: body,
    }),

  logout: () => request('/api/auth/logout', { method: 'POST' }),

  refresh: () => refreshAccessToken(),

  me: () => request('/api/auth/me'),

  profile: () => request('/api/profile'),
};

export const predictApi = {
  warmup: () =>
    request('/api/predict/warmup', {
      params: {
        _: Date.now(),
      },
    }),

  predict: (wavBlob, targetLabel) => {
    const form = new FormData();
    form.append('audio', wavBlob, 'recording.wav');
    form.append('target_label', targetLabel);

    return request('/api/predict', {
      method: 'POST',
      body: form,
    });
  },
};

export const historyApi = {
  getAll: () => request('/api/history'),
  getSummary: (range = 'all') => request('/api/history/summary', { params: { range } }),
  getSession: (sessionId) => request(`/api/history/${sessionId}`),
};

export const profileApi = {
  get: () => request('/api/profile'),
  update: (body) =>
    request('/api/profile', {
      method: 'PUT',
      data: body,
    }),
};
