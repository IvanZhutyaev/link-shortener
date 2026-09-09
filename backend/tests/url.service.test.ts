import { DuplicateShortCodeError } from "../src/repositories/url.repository";
import { UrlService } from "../src/services/url.service";
import { CyclicRedirectError, InvalidUrlError, UrlNotFoundError } from "../src/types/errors";
import { CreateUrlInput, UrlRecord } from "../src/types/url";
import { UrlCache } from "../src/cache/url-cache";
import { UrlRepository } from "../src/repositories/url.repository";

class MemoryUrlRepository {
  private readonly records = new Map<string, UrlRecord>();
  private nextId = 1;
  failNextCreates = 0;

  async create(input: CreateUrlInput): Promise<UrlRecord> {
    if (this.failNextCreates > 0) {
      this.failNextCreates -= 1;
      throw new DuplicateShortCodeError(input.shortCode);
    }

    if (this.records.has(input.shortCode)) {
      throw new DuplicateShortCodeError(input.shortCode);
    }

    const record: UrlRecord = {
      id: this.nextId,
      shortCode: input.shortCode,
      originalUrl: input.originalUrl,
      clicks: 0,
      createdAt: new Date("2026-09-07T12:00:00.000Z"),
    };
    this.nextId += 1;
    this.records.set(input.shortCode, record);
    return record;
  }

  async findByShortCode(shortCode: string): Promise<UrlRecord | null> {
    return this.records.get(shortCode) ?? null;
  }

  async incrementClicks(shortCode: string): Promise<void> {
    const record = this.records.get(shortCode);
    if (record) {
      record.clicks += 1;
    }
  }
}

class MemoryUrlCache {
  private readonly values = new Map<string, string>();

  async getOriginalUrl(shortCode: string): Promise<string | null> {
    return this.values.get(shortCode) ?? null;
  }

  async setOriginalUrl(shortCode: string, originalUrl: string): Promise<void> {
    this.values.set(shortCode, originalUrl);
  }
}

function createService(
  repo: MemoryUrlRepository = new MemoryUrlRepository(),
  cache: MemoryUrlCache = new MemoryUrlCache()
): { service: UrlService; repo: MemoryUrlRepository; cache: MemoryUrlCache } {
  const service = new UrlService(
    repo as unknown as UrlRepository,
    cache as unknown as UrlCache,
    "http://localhost:3000"
  );
  return { service, repo, cache };
}

describe("UrlService", () => {
  it("creates a short link for a valid http(s) URL", async () => {
    const { service } = createService();
    const result = await service.shorten("https://example.com/path");

    expect(result.shortCode).toHaveLength(6);
    expect(result.shortUrl).toBe(`http://localhost:3000/${result.shortCode}`);
  });

  it("rejects an invalid URL", async () => {
    const { service } = createService();
    await expect(service.shorten("not-a-url")).rejects.toBeInstanceOf(InvalidUrlError);
  });

  it("rejects a destination on the same host to prevent redirect loops", async () => {
    const { service } = createService();
    await expect(service.shorten("http://localhost:3000/abc123")).rejects.toBeInstanceOf(
      CyclicRedirectError
    );
  });

  it("retries when the generated short code already exists", async () => {
    const { service, repo } = createService();
    repo.failNextCreates = 1;

    const result = await service.shorten("https://example.com");
    expect(result.shortCode).toHaveLength(6);
  });

  it("reads original URL from postgres on cache miss and stores it in redis", async () => {
    const { service, repo, cache } = createService();
    const created = await service.shorten("https://example.com/cached");

    const originalUrl = await service.resolveForRedirect(created.shortCode);

    expect(originalUrl).toBe("https://example.com/cached");
    expect(await cache.getOriginalUrl(created.shortCode)).toBe("https://example.com/cached");
    expect((await repo.findByShortCode(created.shortCode))?.clicks).toBe(1);
  });

  it("serves original URL from redis on cache hit and still increments clicks", async () => {
    const { service, repo, cache } = createService();
    const created = await service.shorten("https://example.com/hit");
    await cache.setOriginalUrl(created.shortCode, "https://example.com/hit");

    const originalUrl = await service.resolveForRedirect(created.shortCode);

    expect(originalUrl).toBe("https://example.com/hit");
    expect((await repo.findByShortCode(created.shortCode))?.clicks).toBe(1);
  });

  it("returns stats for an existing short code", async () => {
    const { service } = createService();
    const created = await service.shorten("https://example.com/stats");

    const stats = await service.getStats(created.shortCode);

    expect(stats).toMatchObject({
      originalUrl: "https://example.com/stats",
      shortCode: created.shortCode,
      clicks: 0,
    });
  });

  it("throws when short code is missing", async () => {
    const { service } = createService();
    await expect(service.getStats("missing")).rejects.toBeInstanceOf(UrlNotFoundError);
  });
});
