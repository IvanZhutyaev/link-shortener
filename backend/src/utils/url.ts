import { InvalidUrlError } from "../types/errors";

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
