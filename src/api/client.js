import { NativeModules, Platform } from 'react-native';

function getDevHostFromBundle() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname;
  }

  const scriptUrl = NativeModules?.SourceCode?.scriptURL;
  const match = scriptUrl?.match(/^https?:\/\/([^/:]+)/);
  return match?.[1];
}

function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const devHost = getDevHostFromBundle();
  if (devHost) {
    return `http://${devHost}:4000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }

  return 'http://localhost:4000';
}

const API_URL = resolveApiUrl();

export function getApiUrl() {
  return API_URL;
}

let authTokens = {
  accessToken: null,
  refreshToken: null,
};
let onTokensChanged = null;

export function configureApiTokens(tokens, callback) {
  authTokens = {
    accessToken: tokens?.accessToken || null,
    refreshToken: tokens?.refreshToken || null,
  };
  onTokensChanged = callback || onTokensChanged;
}

async function refreshAccessToken() {
  if (!authTokens.refreshToken) {
    throw new Error('No refresh token available.');
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: authTokens.refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Session expired.');
  }

  const data = await response.json();
  authTokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
  if (onTokensChanged) {
    await onTokensChanged(authTokens, data.user);
  }
  return data;
}

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (authTokens.accessToken) {
    headers.Authorization = `Bearer ${authTokens.accessToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(`Could not reach the API at ${API_URL}. Make sure the backend is running with docker compose up --build. If you are using a phone, set EXPO_PUBLIC_API_URL to your computer's LAN IP, for example http://192.168.1.10:4000.`);
  }

  if (response.status === 401 && authTokens.refreshToken && path !== '/auth/refresh') {
    await refreshAccessToken();
    return apiRequest(path, options);
  }

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    const fieldErrors = data.issues?.fieldErrors
      ? Object.entries(data.issues.fieldErrors)
          .flatMap(([field, errors]) => (errors || []).map((error) => `${field}: ${error}`))
          .join('\n')
      : '';
    throw new Error([data.message || 'Request failed.', fieldErrors].filter(Boolean).join('\n'));
  }
  return data;
}

export async function uploadReceipt(uri) {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'receipt.jpg';
  const extension = filename.split('.').pop()?.toLowerCase();
  const type = extension === 'png' ? 'image/png' : 'image/jpeg';

  formData.append('receipt', {
    uri,
    name: filename,
    type,
  });

  return apiRequest('/receipt-drafts', {
    method: 'POST',
    body: formData,
  });
}
