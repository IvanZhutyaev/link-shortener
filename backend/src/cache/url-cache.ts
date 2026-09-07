import { redisClient } from "./redis";

type Redis = Pick<typeof redisClient, "get" | "set">;

export class UrlCache {
  constructor(
    private readonly redis: Redis,
    private readonly ttlSeconds: number
  ) {}

  async getOriginalUrl(shortCode: string): Promise<string | null> {
    return this.redis.get(this.key(shortCode));
  }

  async setOriginalUrl(shortCode: string, originalUrl: string): Promise<void> {
    await this.redis.set(this.key(shortCode), originalUrl, {
      EX: this.ttlSeconds,
    });
  }

  private key(shortCode: string): string {
    return `url:${shortCode}`;
  }
}
