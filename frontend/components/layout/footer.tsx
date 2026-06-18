export function Footer() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-ink-muted">
        <span>© {new Date().getFullYear()} Vespera</span>
        <span>Built on Stellar · Soroban</span>
      </div>
    </footer>
  );
}
