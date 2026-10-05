/** Base URL of the Express API. Override with NEXT_PUBLIC_API_URL in .env.local */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4005";

/** SWR fetcher that surfaces non-2xx responses as errors. */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}
