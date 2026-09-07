import { config } from "./config/env";
import { closeRedis, connectRedis } from "./cache/redis";
import { closeDatabase, connectDatabase } from "./db/pool";
import { createApp } from "./app";

const app = createApp();

async function start(): Promise<void> {
  await connectDatabase();
  console.log("PostgreSQL connected, urls table is ready");

  await connectRedis();
  console.log("Redis connected");

  const server = app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });

  const shutdown = async (): Promise<void> => {
    server.close();
    await closeRedis();
    await closeDatabase();
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
}

start().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
