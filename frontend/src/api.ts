const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface ShortenResponse {
  shortCode: string;
  shortUrl: string;
}

export interface StatsResponse {
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) {
      return data.error;
    }
  } catch {
    // Response was not JSON; fall through to a generic message.
  }

  if (response.status === 404) {
    return "Короткая ссылка не найдена";
  }

  if (response.status === 400) {
    return "Некорректный URL. Укажите адрес с http:// или https://";
  }

  return "Не удалось выполнить запрос. Попробуйте ещё раз";
}

export async function shortenUrl(originalUrl: string): Promise<ShortenResponse> {
  const response = await fetch(`${API_BASE}/api/shorten`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalUrl }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as ShortenResponse;
}

export async function fetchStats(shortCode: string): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE}/api/stats/${encodeURIComponent(shortCode)}`);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as StatsResponse;
}
