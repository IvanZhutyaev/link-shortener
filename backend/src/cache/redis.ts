import { createClient } from "redis";
import { config } from "../config/env";

export const redisClient = createClient({
  url: config.redisUrl,
});

export async function connectRedis(): Promise<void> {
  redisClient.on("error", (error: Error) => {
    console.error("Redis client error", error);
  });

  await redisClient.connect();
}

export async function closeRedis(): Promise<void> {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}
