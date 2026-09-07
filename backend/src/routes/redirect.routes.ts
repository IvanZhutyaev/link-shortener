import { Router } from "express";
import { redirectByShortCode } from "../controllers/url.controller";

export const redirectRouter = Router();

redirectRouter.get("/:shortCode", redirectByShortCode);
