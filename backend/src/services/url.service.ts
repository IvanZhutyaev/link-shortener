import { UrlCache } from "../cache/url-cache";
import { DuplicateShortCodeError, UrlRepository } from "../repositories/url.repository";
import { ShortCodeGenerationError, UrlNotFoundError } from "../types/errors";
import { ShortenResult, UrlRecord, UrlStats } from "../types/url";
import { generateShortCode } from "../utils/short-code";
import { assertNotCyclicRedirect, normalizeHttpUrl } from "../utils/url";

const MAX_CODE_ATTEMPTS = 5;

export class UrlService {
  constructor(
    private readonly urls: UrlRepository,
    private readonly cache: UrlCache,
    private readonly baseUrl: string
  ) {}

  async shorten(originalUrl: string): Promise<ShortenResult> {
    const normalizedUrl = normalizeHttpUrl(originalUrl);
    assertNotCyclicRedirect(normalizedUrl, this.baseUrl);
    const record = await this.createWithUniqueCode(normalizedUrl);

    return {
      shortCode: record.shortCode,
      shortUrl: `${this.baseUrl.replace(/\/$/, "")}/${record.shortCode}`,
    };
  }

  /**
   * Resolves the original URL for a redirect.
   * Original URL is cached in Redis for 1 hour; clicks are always written to Postgres.
   */
  async resolveForRedirect(shortCode: string): Promise<string> {
    const cachedUrl = await this.cache.getOriginalUrl(shortCode);

    if (cachedUrl) {
      console.log(`[cache] HIT shortCode=${shortCode}`);
      await this.urls.incrementClicks(shortCode);
      return cachedUrl;
    }

    console.log(`[cache] MISS shortCode=${shortCode}`);
    const record = await this.urls.findByShortCode(shortCode);

    if (!record) {
      throw new UrlNotFoundError(shortCode);
    }

    await this.cache.setOriginalUrl(shortCode, record.originalUrl);
    await this.urls.incrementClicks(shortCode);

    return record.originalUrl;
  }

  async getStats(shortCode: string): Promise<UrlStats> {
    const record = await this.requireByShortCode(shortCode);

    return {
      originalUrl: record.originalUrl,
      shortCode: record.shortCode,
      clicks: record.clicks,
      createdAt: record.createdAt,
    };
  }

  private async requireByShortCode(shortCode: string): Promise<UrlRecord> {
    const record = await this.urls.findByShortCode(shortCode);

    if (!record) {
      throw new UrlNotFoundError(shortCode);
    }

    return record;
  }

  private async createWithUniqueCode(originalUrl: string): Promise<UrlRecord> {
    for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt += 1) {
      const shortCode = generateShortCode();

      try {
        return await this.urls.create({ shortCode, originalUrl });
      } catch (error) {
        if (!(error instanceof DuplicateShortCodeError) || attempt === MAX_CODE_ATTEMPTS) {
          if (error instanceof DuplicateShortCodeError) {
            throw new ShortCodeGenerationError();
          }
          throw error;
        }
      }
    }

    throw new ShortCodeGenerationError();
  }
}
