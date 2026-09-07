import { Pool } from "pg";
import { CreateUrlInput, UrlRecord } from "../types/url";

const PG_UNIQUE_VIOLATION = "23505";

export class DuplicateShortCodeError extends Error {
  constructor(shortCode: string) {
    super(`Short code already exists: ${shortCode}`);
    this.name = "DuplicateShortCodeError";
  }
}

interface UrlRow {
  id: number;
  short_code: string;
  original_url: string;
  clicks: number;
  created_at: Date;
}

function mapRow(row: UrlRow): UrlRecord {
  return {
    id: row.id,
    shortCode: row.short_code,
    originalUrl: row.original_url,
    clicks: row.clicks,
    createdAt: row.created_at,
  };
}

export class UrlRepository {
  constructor(private readonly db: Pool) {}

  async create(input: CreateUrlInput): Promise<UrlRecord> {
    try {
      const result = await this.db.query<UrlRow>(
        `INSERT INTO urls (short_code, original_url)
         VALUES ($1, $2)
         RETURNING id, short_code, original_url, clicks, created_at`,
        [input.shortCode, input.originalUrl]
      );

      return mapRow(result.rows[0]);
    } catch (error) {
      // Unique constraint on short_code — the service layer can regenerate the code.
      if (isPgError(error) && error.code === PG_UNIQUE_VIOLATION) {
        throw new DuplicateShortCodeError(input.shortCode);
      }
      throw error;
    }
  }

  async findByShortCode(shortCode: string): Promise<UrlRecord | null> {
    const result = await this.db.query<UrlRow>(
      `SELECT id, short_code, original_url, clicks, created_at
       FROM urls
       WHERE short_code = $1`,
      [shortCode]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRow(result.rows[0]);
  }

  async incrementClicks(shortCode: string): Promise<void> {
    await this.db.query(`UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1`, [shortCode]);
  }
}

function isPgError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}
