import { CyclicRedirectError, InvalidUrlError } from "../types/errors";

/**
 * Accepts only absolute http/https URLs.
 * Query, hash and credentials are allowed; javascript: and other schemes are not.
 */
export function normalizeHttpUrl(value: string): string {
  const trimmed = value.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new InvalidUrlError();
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new InvalidUrlError();
  }

  return trimmed;
}

/**
 * Blocks destinations on the same host as this service.
 * Otherwise GET /:shortCode could redirect to another short code and loop.
 */
export function assertNotCyclicRedirect(originalUrl: string, baseUrl: string): void {
  const target = new URL(originalUrl);
  const base = new URL(baseUrl);

  if (target.hostname === base.hostname && target.port === base.port) {
    throw new CyclicRedirectError();
  }
}
