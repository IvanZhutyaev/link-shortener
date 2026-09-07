import { randomBytes } from "crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const SHORT_CODE_LENGTH = 6;

export function generateShortCode(): string {
  const bytes = randomBytes(SHORT_CODE_LENGTH);
  let code = "";

  for (let i = 0; i < SHORT_CODE_LENGTH; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }

  return code;
}
