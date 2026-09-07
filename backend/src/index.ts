import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { closeDatabase, connectDatabase } from "./db/pool";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function start(): Promise<void> {
  await connectDatabase();
  console.log("PostgreSQL connected, urls table is ready");

  const server = app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });

  const shutdown = async (): Promise<void> => {
    server.close();
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
