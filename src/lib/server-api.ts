const baseUrl = (process.env.EQUIPMENT_API_URL ?? "http://localhost:5001").replace(/\/$/, "");

type ServerFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  user?: { id?: string; role?: string | null };
  cache?: RequestCache;
};

/**
 * The equipment API is an Express service. Only this Next.js server talks to
 * it, so the shared internal key and the signed-in user's identity stay out of
 * the browser.
 */
export async function serverFetch<T>(path: string, options: ServerFetchOptions = {}) {
  const headers = new Headers();

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const internalKey = process.env.EQUIPMENT_API_KEY;
  if (internalKey) {
    headers.set("x-api-key", internalKey);
  }

  if (options.user?.id) {
    headers.set("x-user-id", options.user.id);
  }
  if (options.user?.role) {
    headers.set("x-user-role", options.user.role);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: options.cache ?? "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; data?: T; error?: { message?: string } }
    | null;

  return {
    ok: response.ok,
    status: response.status,
    data: payload?.data,
    error: payload?.error?.message,
  };
}
