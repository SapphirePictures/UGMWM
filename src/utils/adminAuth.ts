const ADMIN_SESSION_KEY = 'admin_session_token';

export const setAdminSessionToken = (token: string): void => {
  sessionStorage.setItem(ADMIN_SESSION_KEY, token);
};

export const getAdminSessionToken = (): string | null => {
  return sessionStorage.getItem(ADMIN_SESSION_KEY);
};

export const clearAdminSessionToken = (): void => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
};

export const hasAdminSessionToken = (): boolean => {
  return Boolean(getAdminSessionToken());
};

export const getAdminAuthHeaders = (
  publicAnonKey: string,
  options?: { includeJsonContentType?: boolean }
): Record<string, string> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${publicAnonKey}`,
  };

  if (options?.includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAdminSessionToken();
  if (token) {
    headers['X-Admin-Session'] = token;
  }

  return headers;
};
