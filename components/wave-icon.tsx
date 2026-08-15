export function WaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="10" width="2.4" height="4" rx="1.2" fill="currentColor" />
      <rect x="7.2" y="6" width="2.4" height="12" rx="1.2" fill="currentColor" />
      <rect x="11.4" y="8" width="2.4" height="8" rx="1.2" fill="currentColor" />
      <rect x="15.6" y="4.5" width="2.4" height="15" rx="1.2" fill="currentColor" />
      <rect x="19.8" y="9" width="2.4" height="6" rx="1.2" fill="currentColor" />
    </svg>
  );
}
