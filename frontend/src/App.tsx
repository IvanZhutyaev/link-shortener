import { ShortenForm } from "./components/ShortenForm";
import { StatsForm } from "./components/StatsForm";

export function App() {
  return (
    <div className="page">
      <header className="hero">
        <p className="hero__mark">MVP</p>
        <h1>Короткие ссылки с простой аналитикой</h1>
        <p>Сократите URL и посмотрите, сколько раз по нему переходили.</p>
      </header>
      <main className="layout">
        <ShortenForm />
        <StatsForm />
      </main>
    </div>
  );
}
