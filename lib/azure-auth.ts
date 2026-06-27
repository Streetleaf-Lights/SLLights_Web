/**
 * lib/azure-auth.ts
 * Authenticates requests to Azure API Management (or any API gateway)
 * using a static subscription key passed via the Ocp-Apim-Subscription-Key header.
 * Runs server-side only — never expose your key to the browser.
 */

/**
 * Returns the configured subscription key.
 * Throws clearly if the env var is missing.
 */
export function getSubscriptionKey(): string {
  const key = process.env.AZURE_APIM_SUBSCRIPTION_KEY;
  if (!key) {
    throw new Error(
      "Missing AZURE_APIM_SUBSCRIPTION_KEY. Set it in .env.local"
    );
  }
  return key;
}

/**
 * Make an authenticated GET to any Azure API Management endpoint.
 * Sends the subscription key as Ocp-Apim-Subscription-Key (standard APIM header).
 */
export async function azureFetch(url: string): Promise<unknown> {
  const key = getSubscriptionKey();

  const res = await fetch(url, {
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/json",
    },
    next: { revalidate: 60 }, // cache for 60s (Next.js App Router)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Make an authenticated POST to any Azure API Management endpoint.
 */
export async function azurePost(url: string, body: unknown, fetchOptions?: RequestInit): Promise<unknown> {
  const key = getSubscriptionKey();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    ...fetchOptions,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function azureDelete(url: string, params?: Record<string, unknown>): Promise<unknown> {
  const key = getSubscriptionKey();

  const urlWithParams = params
    ? `${url}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`
    : url;

  const res = await fetch(urlWithParams, {
    method: "DELETE",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure API error ${res.status}: ${text}`);
  }

  return res.json();
}
