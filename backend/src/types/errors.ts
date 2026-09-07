export class InvalidUrlError extends Error {
  constructor(message = "Invalid URL. Expected a valid HTTP or HTTPS address") {
    super(message);
    this.name = "InvalidUrlError";
  }
}

export class UrlNotFoundError extends Error {
  constructor(shortCode: string) {
    super(`Short code not found: ${shortCode}`);
    this.name = "UrlNotFoundError";
  }
}

export class ShortCodeGenerationError extends Error {
  constructor() {
    super("Failed to generate a unique short code");
    this.name = "ShortCodeGenerationError";
  }
}
