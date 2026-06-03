const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * @param {string} endpoint  - e.g. "/api/v1/enseignants"
 * @param {RequestInit} [options]
 * @returns {Promise<unknown>}
 */
export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message ?? `HTTP ${response.status}`);
  }

  return response.json();
}