const isLocalDevHost = (hostname: string) => {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
};

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  (isLocalDevHost(window.location.hostname) ? "http://127.0.0.1:4000/api" : "/api");

export type ApiError = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let payload: ApiError | undefined;
    try {
      payload = (await response.json()) as ApiError;
    } catch {
      payload = undefined;
    }

    const message = Array.isArray(payload?.message)
      ? payload?.message.join("; ")
      : payload?.message || payload?.error || `HTTP ${response.status}`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
