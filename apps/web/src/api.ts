const DEVICE_KEY = "relicwake.device";

export function deviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export class ApiError extends Error {
  code: number;
  body: unknown;
  constructor(code: number, body: unknown) {
    super(typeof body === "object" && body && "error" in body ? String((body as { error: string }).error) : `http_${code}`);
    this.code = code;
    this.body = body;
  }
}

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "content-type": "application/json",
      "x-device-id": deviceId(),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
