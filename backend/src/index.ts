import express from "express";
import cors from "cors";
import { config } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
