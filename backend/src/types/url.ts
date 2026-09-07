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
