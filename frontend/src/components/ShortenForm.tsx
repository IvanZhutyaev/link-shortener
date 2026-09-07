import { FormEvent, useState } from "react";
import { shortenUrl, ShortenResponse } from "../api";
import { Loader } from "./Loader";

export function ShortenForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setCopied(false);
    setLoading(true);

    try {
      const data = await shortenUrl(url);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(): Promise<void> {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
    } catch {
      setError("Не удалось скопировать ссылку в буфер обмена");
    }
  }

  return (
    <section className="card">
      <p className="card__eyebrow">Создание</p>
      <h2>Сократить ссылку</h2>
      <p className="card__hint">Вставьте полный HTTP или HTTPS адрес — получите короткий код из 6 символов.</p>

      <form onSubmit={(event) => void handleSubmit(event)}>
        <label htmlFor="original-url">URL</label>
        <input
          id="original-url"
          type="url"
          placeholder="https://example.com/very/long/path"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          Сократить
        </button>
      </form>

      {loading ? <Loader label="Создаём короткую ссылку…" /> : null}
      {error ? <p className="message message--error">{error}</p> : null}

      {result && !loading ? (
        <div className="result">
          <a href={result.shortUrl} target="_blank" rel="noreferrer">
            {result.shortUrl}
          </a>
          <button type="button" className="button--secondary" onClick={() => void handleCopy()}>
            {copied ? "Скопировано" : "Копировать в буфер обмена"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
