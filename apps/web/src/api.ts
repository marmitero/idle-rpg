const DEVICE_KEY = "relicwake.device";
const TOKEN_KEY = "relicwake.jwt";

export function deviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  code: number;
  body: unknown;
  constructor(code: number, body: unknown) {
    super(
      typeof body === "object" && body && "error" in body
        ? String((body as { error: string }).error)
        : `http_${code}`,
    );
    this.code = code;
    this.body = body;
  }
}

export async function api<T>(path: string, body?: unknown, extra?: Record<string, string>): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-device-id": deviceId(),
  };
  if (token) headers.authorization = `Bearer ${token}`;
  if (extra) Object.assign(headers, extra);
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers,
    body: body === undefined ? null : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
