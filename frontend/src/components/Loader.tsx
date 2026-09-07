interface LoaderProps {
  label: string;
}

export function Loader({ label }: LoaderProps) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" />
      <span>{label}</span>
    </div>
  );
}
