import { Request, Response } from "express";
import { urlService } from "../container";
import { InvalidUrlError } from "../types/errors";
import { asyncHandler } from "../middleware/async-handler";

interface ShortenRequestBody {
  originalUrl?: unknown;
}

export const shortenUrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { originalUrl } = req.body as ShortenRequestBody;

  if (typeof originalUrl !== "string" || originalUrl.trim() === "") {
    throw new InvalidUrlError("originalUrl is required and must be a string");
  }

  const result = await urlService.shorten(originalUrl);
  res.status(201).json(result);
});

export const redirectByShortCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { shortCode } = req.params;
  const originalUrl = await urlService.resolveForRedirect(shortCode);
  res.redirect(302, originalUrl);
});

export const getStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { shortCode } = req.params;
  const stats = await urlService.getStats(shortCode);
  res.json(stats);
});
