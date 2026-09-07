import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler";
import { apiRouter } from "./routes/api.routes";
import { redirectRouter } from "./routes/redirect.routes";

export function createApp(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", apiRouter);
  // Catch-all redirect must stay after /api and /health.
  app.use(redirectRouter);

  app.use(errorHandler);

  return app;
}
