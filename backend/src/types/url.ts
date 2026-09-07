export interface UrlRecord {
  id: number;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
}

export interface CreateUrlInput {
  shortCode: string;
  originalUrl: string;
}

export interface ShortenResult {
  shortCode: string;
  shortUrl: string;
}

export interface UrlStats {
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: Date;
}
