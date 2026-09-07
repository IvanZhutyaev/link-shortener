import { config } from "./config/env";
import { UrlCache } from "./cache/url-cache";
import { redisClient } from "./cache/redis";
import { pool } from "./db/pool";
import { UrlRepository } from "./repositories/url.repository";
import { UrlService } from "./services/url.service";

export const urlRepository = new UrlRepository(pool);
export const urlCache = new UrlCache(redisClient, config.redisTtlSeconds);
export const urlService = new UrlService(urlRepository, urlCache, config.baseUrl);
