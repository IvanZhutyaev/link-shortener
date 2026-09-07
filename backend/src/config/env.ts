import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

export interface AppConfig {
  port: number;
  databaseUrl: string;
  redisUrl: string;
  baseUrl: string;
  redisTtlSeconds: number;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: requireEnv("DATABASE_URL"),
  redisUrl: requireEnv("REDIS_URL"),
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  redisTtlSeconds: Number(process.env.REDIS_TTL_SECONDS) || 3600,
};
