import { NextFunction, Request, Response } from "express";
import {
  CyclicRedirectError,
  InvalidUrlError,
  ShortCodeGenerationError,
  UrlNotFoundError,
} from "../types/errors";
import { ApiErrorBody, apiError } from "../types/http";

/**
 * Every failed response uses { error: { message, statusCode } }.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response<ApiErrorBody>,
  _next: NextFunction
): void {
  if (isJsonParseError(error)) {
    res.status(400).json(apiError(400, "Invalid JSON body"));
    return;
  }

  if (error instanceof InvalidUrlError || error instanceof CyclicRedirectError) {
    res.status(400).json(apiError(400, error.message));
    return;
  }

  if (error instanceof UrlNotFoundError) {
    res.status(404).json(apiError(404, error.message));
    return;
  }

  if (error instanceof ShortCodeGenerationError) {
    res.status(500).json(apiError(500, error.message));
    return;
  }

  console.error("Unhandled error", error);
  res.status(500).json(apiError(500, "Internal server error"));
}

export function notFoundHandler(req: Request, res: Response<ApiErrorBody>): void {
  res.status(404).json(apiError(404, `Route not found: ${req.method} ${req.path}`));
}

function isJsonParseError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    "status" in error &&
    (error as { status?: number }).status === 400
  );
}
