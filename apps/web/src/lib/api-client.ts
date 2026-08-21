// Client-side counterpart to lib/api.ts — same-origin via next.config.ts's rewrite, so the
// browser sends cookies automatically; no manual cookie forwarding needed here.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

// The access token is short-lived (15m, P3) and there's no background refresh — any mutation
// made after that window 401s. Refresh once and retry rather than surfacing a spurious failure
// to the user in the middle of a normal session.
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch("/api/v1/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

export async function apiMutate<T>(path: string, init: RequestInit = {}, _retried = false): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });

  if (res.status === 401 && !_retried && (await refreshSession())) {
    return apiMutate<T>(path, init, true);
  }

  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new ApiError(res.status, problem?.detail ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
