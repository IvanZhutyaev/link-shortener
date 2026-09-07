import { FormEvent, useState } from "react";
import { fetchStats, StatsResponse } from "../api";
import { Loader } from "./Loader";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ru-RU");
}

export function StatsForm() {
  const [shortCode, setShortCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await fetchStats(shortCode.trim());
      setStats(data);
    } catch (err) {
      setStats(null);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <p className="card__eyebrow">Аналитика</p>
      <h2>Статистика</h2>
      <p className="card__hint">Введите короткий код, например abc123, чтобы посмотреть переходы.</p>

      <form onSubmit={(event) => void handleSubmit(event)}>
        <label htmlFor="short-code">Короткий код</label>
        <input
          id="short-code"
          type="text"
          placeholder="abc123"
          value={shortCode}
          onChange={(event) => setShortCode(event.target.value)}
          required
          minLength={6}
          maxLength={10}
        />
        <button type="submit" disabled={loading}>
          Получить статистику
        </button>
      </form>

      {loading ? <Loader label="Загружаем статистику…" /> : null}
      {error ? <p className="message message--error">{error}</p> : null}

      {stats && !loading ? (
        <dl className="stats">
          <div>
            <dt>Оригинальный URL</dt>
            <dd>
              <a href={stats.originalUrl} target="_blank" rel="noreferrer">
                {stats.originalUrl}
              </a>
            </dd>
          </div>
          <div>
            <dt>Количество переходов</dt>
            <dd>{stats.clicks}</dd>
          </div>
          <div>
            <dt>Дата создания</dt>
            <dd>{formatDate(stats.createdAt)}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
