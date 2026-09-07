import { NextFunction, Request, Response } from "express";
import {
  InvalidUrlError,
  ShortCodeGenerationError,
  UrlNotFoundError,
} from "../types/errors";

interface ErrorBody {
  error: string;
}

/**
 * Maps domain errors to HTTP status codes from the assignment:
 * invalid URL -> 400, missing code -> 404, generation failure -> 500.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response<ErrorBody>,
  _next: NextFunction
): void {
  if (error instanceof InvalidUrlError) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof UrlNotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error instanceof ShortCodeGenerationError) {
    res.status(500).json({ error: error.message });
    return;
  }

  console.error("Unhandled error", error);
  res.status(500).json({ error: "Internal server error" });
}
