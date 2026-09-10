export class ApiError extends Error {
  status: number;
  code: string;
  data: any;

  constructor(message: string, status = 500, code = 'API_ERROR', data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const AUTH_TOKEN_KEY = 'luxestore_auth_token';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Failed to save auth token to localStorage', e);
  }
}

export async function apiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const storedToken = getStoredAuthToken();
  if (storedToken) {
    defaultHeaders['Authorization'] = `Bearer ${storedToken}`;
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Includes HttpOnly session cookie across same-origin and iframe requests
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  };

  let response: Response;
  try {
    response = await fetch(endpoint, config);
  } catch (netErr: any) {
    throw new ApiError(
      netErr?.message || 'Network connection failed. Please check your internet connection.',
      0,
      'NETWORK_ERROR'
    );
  }

  let json: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      json = await response.json();
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    const errorMsg = json?.error?.message || `Request failed with status ${response.status}`;
    const errorCode = json?.error?.code || 'API_ERROR';
    
    // Broadcast 401 so Auth provider can respond if an active session expires
    if (response.status === 401) {
      setStoredAuthToken(null);
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    throw new ApiError(errorMsg, response.status, errorCode, json);
  }

  return json;
}

