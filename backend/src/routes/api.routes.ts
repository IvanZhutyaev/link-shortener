import { Router } from "express";
import { getStats, shortenUrl } from "../controllers/url.controller";

export const apiRouter = Router();

apiRouter.post("/shorten", shortenUrl);
apiRouter.get("/stats/:shortCode", getStats);
